import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  medicinesTable,
  pharmaciesTable,
  pharmacyMedicinesTable,
} from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import {
  AddMedicineToPharmacyDto,
  UpdatePharmacyMedicineDto,
} from './dtos/pharmacy-medicine.dto';
import { PharmaciesService } from '../pharmacies/pharmacies.service';

@Injectable()
export class PharmacyMedicinesService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly pharmaciesService: PharmaciesService,
  ) {
    super(pharmacyMedicinesTable, con);
  }

  async findMedicinesByPharmacy(pharmacyId: string) {
    await this.pharmaciesService.findById(pharmacyId);

    const result = await this.con
      .select({
        pharmacyMedicine: pharmacyMedicinesTable,
        medicine: {
          id: medicinesTable.id,
          name: medicinesTable.name,
          description: medicinesTable.description,
          image: medicinesTable.image,
          substance: medicinesTable.substance,
        },
      })
      .from(pharmacyMedicinesTable)
      .innerJoin(
        medicinesTable,
        eq(pharmacyMedicinesTable.medicineId, medicinesTable.id),
      )
      .where(eq(pharmacyMedicinesTable.pharmacyId, pharmacyId));

    return result;
  }

  async findPharmaciesByMedicine(medicineId: string) {
    const result = await this.con
      .select({
        pharmacyMedicine: pharmacyMedicinesTable,
        pharmacy: {
          id: pharmaciesTable.id,
          name: pharmaciesTable.name,
          description: pharmaciesTable.description,
          address: pharmaciesTable.address,
          phone: pharmaciesTable.phone,
          email: pharmaciesTable.email,
          image: pharmaciesTable.image,
          isActive: pharmaciesTable.isActive,
        },
      })
      .from(pharmacyMedicinesTable)
      .innerJoin(
        pharmaciesTable,
        eq(pharmacyMedicinesTable.pharmacyId, pharmaciesTable.id),
      )
      .where(
        and(
          eq(pharmacyMedicinesTable.medicineId, medicineId),
          eq(pharmaciesTable.isActive, true),
        ),
      );

    return result;
  }

  async addMedicineToPharmacy(
    pharmacyId: string,
    medicineId: string,
    data: AddMedicineToPharmacyDto,
  ) {
    const existing = await this.findFirst(
      and(
        eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
        eq(pharmacyMedicinesTable.medicineId, medicineId),
      ) || eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
    );

    if (existing) {
      const updated = await this.update(
        and(
          eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
          eq(pharmacyMedicinesTable.medicineId, medicineId),
        ),
        data,
      );
      return updated[0];
    }

    return this.create({
      pharmacyId,
      medicineId,
      ...data,
    });
  }

  async updatePharmacyMedicine(
    pharmacyId: string,
    medicineId: string,
    data: UpdatePharmacyMedicineDto,
  ) {
    const existing = await this.findFirst(
      and(
        eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
        eq(pharmacyMedicinesTable.medicineId, medicineId),
      ) || eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
    );

    if (!existing) {
      throw new NotFoundException('Medicine not found in this pharmacy');
    }

    const updated = await this.update(
      and(
        eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
        eq(pharmacyMedicinesTable.medicineId, medicineId),
      ),
      data,
    );

    return updated[0];
  }

  async removeMedicineFromPharmacy(pharmacyId: string, medicineId: string) {
    const existing = await this.findFirst(
      and(
        eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
        eq(pharmacyMedicinesTable.medicineId, medicineId),
      ) || eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
    );

    if (!existing) {
      throw new NotFoundException('Medicine not found in this pharmacy');
    }

    return this.delete(
      and(
        eq(pharmacyMedicinesTable.pharmacyId, pharmacyId),
        eq(pharmacyMedicinesTable.medicineId, medicineId),
      ),
    );
  }
}

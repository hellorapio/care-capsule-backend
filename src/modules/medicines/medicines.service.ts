import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { medicinesTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { UploadService } from 'src/global/upload/upload.service';
import {
  CreateMedicineDto,
  GetMedicinesDto,
  UpdateMedicineDto,
} from './dtos/medicine.dto';

@Injectable()
export class MedicinesService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly uploadService: UploadService,
  ) {
    super(medicinesTable, con);
  }

  async findMedicines(
    params: GetMedicinesDto = { page: 1, limit: 10, category: 'care' },
  ): Promise<any> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const data = await this.con.query.medicinesTable.findMany({
      where: sql`${this.table['category']} = ${params.category || 'care'}`,
      orderBy: sql`${this.table['createdAt']} DESC`,
      limit,
      offset,
    });

    const countResult = await this.con
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(this.table)
      .where(sql`${this.table['category']} = ${params.category || 'care'}`);

    const total = Number(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: string) {
    const medicine = await this.findFirst(eq(medicinesTable.id, id));
    if (!medicine) throw new NotFoundException('Medicine not found');
    return medicine;
  }

  async createMedicine(createMedicineDto: CreateMedicineDto) {
    return this.create(createMedicineDto);
  }

  async updateMedicine(id: string, updateMedicineDto: UpdateMedicineDto) {
    await this.findById(id);

    const [updatedMedicine] = await this.updateById(id, updateMedicineDto);
    return updatedMedicine;
  }

  async updateMedicineImage(id: string, file: Express.Multer.File) {
    await this.findById(id);
    const uploadResult = await this.uploadService.uploadToBucket(file);
    const [updatedMedicine] = await this.updateById(id, {
      image: uploadResult,
    });
    return updatedMedicine;
  }

  async deleteMedicine(id: string) {
    return this.deleteById(id);
  }
}

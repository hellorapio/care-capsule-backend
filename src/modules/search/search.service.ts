import { Inject, Injectable } from '@nestjs/common';
import { like, or } from 'drizzle-orm';
import { medicinesTable, pharmaciesTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';

@Injectable()
export class SearchService extends DatabaseRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase) {
    super(pharmaciesTable, con);
  }

  async search(query: string) {
    const pharmacies = await this.con.query.pharmaciesTable.findMany({
      where: or(
        like(pharmaciesTable.name, `%${query}%`),
        like(pharmaciesTable.address, `%${query}%`),
      ),
      limit: 10,
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    const medicines = await this.con.query.medicinesTable.findMany({
      where: or(
        like(medicinesTable.name, `%${query}%`),
        like(medicinesTable.substance, `%${query}%`),
      ),
      limit: 10,
      columns: {
        id: true,
        name: true,
        image: true,
      },
    });

    // medicines.map((medicine) => {
    //   return {
    //     name: medicine.name,
    //     id: medicine.id,
    //     image: medicine.image,
    //     type: 'medicine',
    //   };
    // });

    // pharmacies.map((pharmacy) => {
    //   return {
    //     name: pharmacy.name,
    //     id: pharmacy.id,
    //     image: pharmacy.image,
    //     type: 'pharmacy',
    //   };
    // });

    return { pharmacies, medicines };
  }
}

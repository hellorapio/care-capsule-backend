import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { medicinesTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { UploadService } from 'src/global/upload/upload.service';
import { CreateMedicineDto, UpdateMedicineDto } from './dtos/medicine.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class MedicinesService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly uploadService: UploadService,
    private readonly categoriesService: CategoriesService,
  ) {
    super(medicinesTable, con);
  }

  async findById(id: string) {
    const medicine = await this.findFirst(eq(medicinesTable.id, id));
    if (!medicine) throw new NotFoundException('Medicine not found');
    return medicine;
  }

  async findByCategory(categoryId: string) {
    return this.findManyWithoutFilter(
      eq(medicinesTable.categoryId, categoryId),
      eq(medicinesTable.createdAt, medicinesTable.createdAt),
    );
  }

  async createMedicine(createMedicineDto: CreateMedicineDto) {
    if (createMedicineDto.categoryId) {
      await this.categoriesService.findById(createMedicineDto.categoryId);
    }
    return this.create(createMedicineDto);
  }

  async updateMedicine(id: string, updateMedicineDto: UpdateMedicineDto) {
    await this.findById(id);

    if (updateMedicineDto.categoryId) {
      await this.categoriesService.findById(updateMedicineDto.categoryId);
    }

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
    await this.findById(id);
    return this.deleteById(id);
  }
}

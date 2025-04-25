import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { pharmaciesTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { UploadService } from 'src/global/upload/upload.service';
import { CreatePharmacyDto, UpdatePharmacyDto } from './dtos/pharmacy.dto';

@Injectable()
export class PharmaciesService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly uploadService: UploadService,
  ) {
    super(pharmaciesTable, con);
  }

  async findById(id: string) {
    const pharmacy = await this.findFirst(eq(pharmaciesTable.id, id));
    if (!pharmacy) throw new NotFoundException('Pharmacy not found');
    return pharmacy;
  }

  async findByOwnerId(ownerId: string) {
    return this.findManyWithoutFilter(
      eq(pharmaciesTable.ownerId, ownerId),
      eq(pharmaciesTable.createdAt, pharmaciesTable.createdAt),
    );
  }

  async createPharmacy(ownerId: string, createPharmacyDto: CreatePharmacyDto) {
    return this.create({
      ...createPharmacyDto,
      ownerId,
    });
  }

  async updatePharmacy(id: string, updatePharmacyDto: UpdatePharmacyDto) {
    await this.findById(id);
    const [updatedPharmacy] = await this.updateById(id, updatePharmacyDto);
    return updatedPharmacy;
  }

  async updatePharmacyImage(id: string, file: Express.Multer.File) {
    await this.findById(id);
    const uploadResult = await this.uploadService.uploadToBucket(file);
    const [updatedPharmacy] = await this.updateById(id, {
      image: uploadResult,
    });
    return updatedPharmacy;
  }

  async togglePharmacyStatus(id: string) {
    const pharmacy = await this.findById(id);
    const [updatedPharmacy] = await this.updateById(id, {
      isActive: !pharmacy.isActive,
    });
    return updatedPharmacy;
  }

  async deletePharmacy(id: string) {
    await this.findById(id);
    return this.deleteById(id);
  }
}
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { res } from 'src/utils/utils';
import { PharmacyMedicinesService } from './pharmacy-medicine.service';
import { CreateMedicineDto, UpdateMedicineDto } from './dtos/medicine.dto';
// import {
//   AddMedicineToPharmacyDto,
//   UpdatePharmacyMedicineDto,
// } from './dtos/pharmacy-medicine.dto';
import { MedicinesService } from './medicines.service';
import Public from 'src/decorators/Public.decorator';
@Public()
@Controller('medicines')
export class MedicinesController {
  constructor(
    private readonly medicinesService: MedicinesService,
    private readonly pharmacyMedicinesService: PharmacyMedicinesService,
  ) {}

  @Get('/')
  async getAllMedicines() {
    const data = await this.medicinesService.findAll();
    return res(data, 'Medicines retrieved successfully', 200);
  }

  // @Get('/category/:categoryId')
  // async getMedicinesByCategory(@Param('categoryId') categoryId: string) {
  //   const data = await this.medicinesService.findByCategory(categoryId);
  //   return res(data, 'Medicines retrieved successfully', 200);
  // }

  @Get('/:id')
  async getMedicineById(@Param('id') id: string) {
    const data = await this.medicinesService.findById(id);
    return res(data, 'Medicine retrieved successfully', 200);
  }

  @Get('/:id/pharmacies')
  async getPharmaciesWithMedicine(@Param('id') id: string) {
    const data =
      await this.pharmacyMedicinesService.findPharmaciesByMedicine(id);
    return res(
      data,
      'Pharmacies with this medicine retrieved successfully',
      200,
    );
  }

  @Post('/')
  async createMedicine(@Body() createMedicineDto: CreateMedicineDto) {
    const data = await this.medicinesService.createMedicine(createMedicineDto);
    return res(data, 'Medicine created successfully', 201);
  }

  @Patch('/:id')
  async updateMedicine(
    @Param('id') id: string,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    const data = await this.medicinesService.updateMedicine(
      id,
      updateMedicineDto,
    );
    return res(data, 'Medicine updated successfully', 200);
  }

  @Patch('/:id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async updateMedicineImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.medicinesService.updateMedicineImage(id, file);
    return res(data, 'Medicine image updated successfully', 200);
  }

  @Delete('/:id')
  async deleteMedicine(@Param('id') id: string) {
    const data = await this.medicinesService.deleteMedicine(id);
    return res(data, 'Medicine deleted successfully', 200);
  }

  // @Post('/pharmacy/:pharmacyId/:medicineId')
  // async addMedicineToPharmacy(
  //   @Param('pharmacyId') pharmacyId: string,
  //   @Param('medicineId') medicineId: string,
  //   @Body() addMedicineDto: AddMedicineToPharmacyDto,
  // ) {
  //   const data = await this.pharmacyMedicinesService.addMedicineToPharmacy(
  //     pharmacyId,
  //     medicineId,
  //     addMedicineDto,
  //   );
  //   return res(data, 'Medicine added to pharmacy successfully', 201);
  // }

  // @Patch('/pharmacy/:pharmacyId/:medicineId')
  // async updatePharmacyMedicine(
  //   @Param('pharmacyId') pharmacyId: string,
  //   @Param('medicineId') medicineId: string,
  //   @Body() updateDto: UpdatePharmacyMedicineDto,
  // ) {
  //   const data = await this.pharmacyMedicinesService.updatePharmacyMedicine(
  //     pharmacyId,
  //     medicineId,
  //     updateDto,
  //   );
  //   return res(data, 'Pharmacy medicine updated successfully', 200);
  // }

  // @Delete('/pharmacy/:pharmacyId/:medicineId')
  // async removeMedicineFromPharmacy(
  //   @Param('pharmacyId') pharmacyId: string,
  //   @Param('medicineId') medicineId: string,
  // ) {
  //   const data = await this.pharmacyMedicinesService.removeMedicineFromPharmacy(
  //     pharmacyId,
  //     medicineId,
  //   );
  //   return res(data, 'Medicine removed from pharmacy successfully', 200);
  // }
}

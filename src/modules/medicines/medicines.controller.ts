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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { res } from 'src/utils/utils';
import { PharmacyMedicinesService } from './pharmacy-medicine.service';
import {
  CreateMedicineDto,
  GetMedicinesDto,
  UpdateMedicineDto,
} from './dtos/medicine.dto';
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
  async getAllMedicines(@Query() getMedicinesDto: GetMedicinesDto) {
    const data = await this.medicinesService.findMedicines(getMedicinesDto);
    return res(
      data as Record<string, any> | Record<string, any>[],
      'Medicines retrieved successfully',
      200,
    );
  }

  @Get('/:id')
  async getMedicineById(@Param('id') id: string) {
    const data = await this.medicinesService.findById(id);
    return res(data, 'Medicine retrieved successfully', 200);
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
}

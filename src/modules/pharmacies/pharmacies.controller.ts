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
import { PharmaciesService } from './pharmacies.service';
import User from 'src/decorators/User.decorator';
import { CreatePharmacyDto, UpdatePharmacyDto } from './dtos/pharmacy.dto';
import { res } from 'src/utils/utils';
import Public from 'src/decorators/Public.decorator';

@Public()
@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Get('/')
  async getAllPharmacies() {
    const data = await this.pharmaciesService.findAll();
    return res(data, 'Pharmacies retrieved successfully', 200);
  }

  @Get('/my-pharmacies')
  async getMyPharmacies(@User('id') userId: string) {
    const data = await this.pharmaciesService.findByOwnerId(userId);
    return res(data, 'User pharmacies retrieved successfully', 200);
  }

  @Get('/:id')
  async getPharmacyById(@Param('id') id: string) {
    const data = await this.pharmaciesService.findById(id);
    return res(data, 'Pharmacy retrieved successfully', 200);
  }

  @Post('/')
  async createPharmacy(
    @User('id') userId: string,
    @Body() createPharmacyDto: CreatePharmacyDto,
  ) {
    const data = await this.pharmaciesService.createPharmacy(
      userId,
      createPharmacyDto,
    );
    return res(data, 'Pharmacy created successfully', 201);
  }

  @Patch('/:id')
  async updatePharmacy(
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    const data = await this.pharmaciesService.updatePharmacy(
      id,
      updatePharmacyDto,
    );
    return res(data, 'Pharmacy updated successfully', 200);
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
  async updatePharmacyImage(
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
    const data = await this.pharmaciesService.updatePharmacyImage(id, file);
    return res(data, 'Pharmacy image updated successfully', 200);
  }

  @Patch('/:id/toggle-status')
  async togglePharmacyStatus(@Param('id') id: string) {
    const data = await this.pharmaciesService.togglePharmacyStatus(id);
    return res(data, 'Pharmacy status toggled successfully', 200);
  }

  @Delete('/:id')
  async deletePharmacy(@Param('id') id: string) {
    const data = await this.pharmaciesService.deletePharmacy(id);
    return res(data, 'Pharmacy deleted successfully', 200);
  }
}

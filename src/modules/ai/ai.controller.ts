import { res } from 'src/utils/utils';
import { AiService } from './ai.service';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import Public from 'src/decorators/Public.decorator';

@Controller('ai')
@Public()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process-image')
  @UseInterceptors(FileInterceptor('file'))
  async processImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const data = await this.aiService.processImage(file);
    return res(data, 'Medicine information extracted successfully', 200);
  }
}

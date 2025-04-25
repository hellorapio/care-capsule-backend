import {
  Controller,
  Get,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MeService } from './me.service';
import User from 'src/decorators/User.decorator';
import { UpdateUserDto } from './dtos/user.dto';
import { res } from 'src/utils/utils';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('/')
  async getMe(@User('id') userId: string) {
    const data = await this.meService.findMe(userId);
    return res(data, 'User data returned successfully', 200);
  }

  @Patch('/')
  async updateMe(
    @User('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.meService.updateMe(userId, updateUserDto);
    return res(data, 'User updated successfully', 200);
  }

  @Patch('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @User('id') userId: string,
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
    const data = await this.meService.updateAvatar(userId, file);
    return res(data, 'File uploaded successfully', 200);
  }
}

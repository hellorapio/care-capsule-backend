import { UploadService } from './../../global/upload/upload.service';
import { UsersService } from 'src/modules/users/users.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { usersTable } from 'src/drizzle/schema';
import { UpdateUserDto } from './dtos/user.dto';

@Injectable()
export class MeService {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  async findMe(userId: string) {
    const user = await this.usersService.findFirst(eq(usersTable.id, userId));

    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete user.password;
    delete user.refresh;

    return user;
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    await this.findMe(userId);

    const [updatedUser] = await this.usersService.updateById(userId, {
      ...updateUserDto,
    });

    delete updatedUser.password;
    delete updatedUser.refresh;

    return updatedUser;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const uploadResult = await this.uploadService.uploadToBucket(file);
    const [updatedUser] = await this.usersService.updateById(userId, {
      image: uploadResult,
    });

    return updatedUser;
  }
}

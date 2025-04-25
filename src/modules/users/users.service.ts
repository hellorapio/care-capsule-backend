import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { usersTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';

@Injectable()
export class UsersService extends DatabaseRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase) {
    super(usersTable, con);
  }

  async findById(id: string) {
    const user = await this.findFirst(eq(usersTable.id, id));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

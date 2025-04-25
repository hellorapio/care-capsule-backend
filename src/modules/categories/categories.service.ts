import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { categoriesTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos/category.dto';

@Injectable()
export class CategoriesService extends DatabaseRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase) {
    super(categoriesTable, con);
  }

  async findById(id: string) {
    const category = await this.findFirst(eq(categoriesTable.id, id));
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    return this.create(createCategoryDto);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findById(id);
    const [updatedCategory] = await this.updateById(id, updateCategoryDto);
    return updatedCategory;
  }

  async deleteCategory(id: string) {
    await this.findById(id);
    return this.deleteById(id);
  }
}

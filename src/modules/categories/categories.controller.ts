import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos/category.dto';
import { res } from 'src/utils/utils';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/')
  async getAllCategories() {
    const data = await this.categoriesService.findAll();
    return res(data, 'Categories retrieved successfully', 200);
  }

  @Get('/:id')
  async getCategoryById(@Param('id') id: string) {
    const data = await this.categoriesService.findById(id);
    return res(data, 'Category retrieved successfully', 200);
  }

  @Post('/')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.createCategory(createCategoryDto);
    return res(data, 'Category created successfully', 201);
  }

  @Patch('/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.updateCategory(
      id,
      updateCategoryDto,
    );
    return res(data, 'Category updated successfully', 200);
  }

  @Delete('/:id')
  async deleteCategory(@Param('id') id: string) {
    const data = await this.categoriesService.deleteCategory(id);
    return res(data, 'Category deleted successfully', 200);
  }
}

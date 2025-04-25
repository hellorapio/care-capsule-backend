import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dtos/reviews.dto';
import { res } from 'src/utils/utils';
import User from 'src/decorators/User.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/')
  async getReviewsByPharmacy(@Query('pharmacyId') pharmacyId: string) {
    const data = await this.reviewsService.findByPharmacy(pharmacyId);
    return res(data, 'Reviews retrieved successfully', 200);
  }

  @Get('/:id')
  async getReviewById(@Param('id') id: string) {
    const data = await this.reviewsService.findById(id);
    return res(data, 'Review retrieved successfully', 200);
  }

  @Post('/')
  async createReview(
    @User('id') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const data = await this.reviewsService.createReview(
      userId,
      createReviewDto,
    );
    return res(data, 'Review created successfully', 201);
  }

  @Patch('/:id')
  async updateReview(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const data = await this.reviewsService.updateReview(
      id,
      userId,
      updateReviewDto,
    );
    return res(data, 'Review updated successfully', 200);
  }

  @Delete('/:id')
  async deleteReview(@Param('id') id: string, @User('id') userId: string) {
    const data = await this.reviewsService.deleteReview(id, userId);
    return res(data, 'Review deleted successfully', 200);
  }
}

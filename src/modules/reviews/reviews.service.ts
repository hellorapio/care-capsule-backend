import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, avg, count } from 'drizzle-orm';
import { reviewsTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { CreateReviewDto, UpdateReviewDto } from './dtos/reviews.dto';
import { PharmaciesService } from '../pharmacies/pharmacies.service';

@Injectable()
export class ReviewsService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly pharmaciesService: PharmaciesService,
  ) {
    super(reviewsTable, con);
  }

  async findById(id: string) {
    const review = await this.findFirst(eq(reviewsTable.id, id));
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async findByPharmacy(pharmacyId: string) {
    await this.pharmaciesService.findById(pharmacyId);
    return this.findManyWithoutFilter(
      eq(reviewsTable.pharmacyId, pharmacyId),
      eq(reviewsTable.createdAt, reviewsTable.createdAt),
    );
  }

  async findByUser(userId: string) {
    return this.findManyWithoutFilter(
      eq(reviewsTable.userId, userId),
      eq(reviewsTable.createdAt, reviewsTable.createdAt),
    );
  }

  async getUserReviewForPharmacy(userId: string, pharmacyId: string) {
    return this.findFirst(
      and(
        eq(reviewsTable.userId, userId),
        eq(reviewsTable.pharmacyId, pharmacyId),
      ) || eq(reviewsTable.pharmacyId, pharmacyId),
    );
  }

  async getPharmacyRatingStats(pharmacyId: string) {
    await this.pharmaciesService.findById(pharmacyId);

    const [averageRating] = await this.con
      .select({
        average: avg(reviewsTable.rating),
        total: count(),
      })
      .from(reviewsTable)
      .where(eq(reviewsTable.pharmacyId, pharmacyId));

    return {
      averageRating: averageRating.average
        ? Number(averageRating.average).toFixed(1)
        : 0,
      totalReviews: averageRating.total,
    };
  }

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    await this.pharmaciesService.findById(createReviewDto.pharmacyId);

    // Check if user already reviewed this pharmacy
    const existingReview = await this.getUserReviewForPharmacy(
      userId,
      createReviewDto.pharmacyId,
    );

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this pharmacy');
    }

    // Validate rating is between 1 and 5
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    return this.create({
      userId,
      ...createReviewDto,
    });
  }

  async updateReview(
    id: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.findById(id);

    // Ensure the review belongs to the user
    if (review.userId !== userId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    // Validate rating is between 1 and 5 if provided
    if (
      updateReviewDto.rating &&
      (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)
    ) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const [updatedReview] = await this.updateById(id, updateReviewDto);
    return updatedReview;
  }

  async deleteReview(id: string, userId: string) {
    const review = await this.findById(id);

    // Ensure the review belongs to the user
    if (review.userId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    return this.deleteById(id);
  }
}

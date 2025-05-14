import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dtos/wishlist.dto';
import { res } from 'src/utils/utils';
import User from 'src/decorators/User.decorator';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('/')
  async getWishlist(@User('id') userId: string) {
    const data = await this.wishlistService.getWishlist(userId);
    return res(data, 'Wishlist retrieved successfully', 200);
  }

  @Post('/')
  async addToWishlist(
    @User('id') userId: string,
    @Body() dto: AddToWishlistDto,
  ) {
    const data = await this.wishlistService.addToWishlist(userId, dto);
    return res(data, 'Item added to wishlist', 201);
  }

  @Delete('/:medicineId')
  async removeFromWishlist(
    @User('id') userId: string,
    @Param('medicineId') medicineId: string,
  ) {
    const data = await this.wishlistService.removeFromWishlist(
      userId,
      medicineId,
    );
    return res(data, 'Item removed from wishlist', 200);
  }
}

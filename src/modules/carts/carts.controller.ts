import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto, UpdateCartItemDto } from './dtos/cart.dto';
import { res } from 'src/utils/utils';
import User from 'src/decorators/User.decorator';

@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('/')
  async getCart(@User('id') userId: string) {
    const data = await this.cartsService.getCartWithItems(userId);
    return res(data, 'Cart retrieved successfully', 200);
  }

  @Post('/')
  async addToCart(
    @User('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const data = await this.cartsService.addItemToCart(userId, addToCartDto);
    return res(data, 'Item added to cart successfully', 201);
  }

  @Patch('/:medicineId')
  async updateCartItem(
    @User('id') userId: string,
    @Param('medicineId') medicineId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const data = await this.cartsService.updateCartItem(
      userId,
      medicineId,
      updateCartItemDto,
    );
    return res(data, 'Cart item updated successfully', 200);
  }

  @Delete('/clear')
  async clearCart(@User('id') userId: string) {
    const data = await this.cartsService.clearCart(userId);
    return res(data, 'Cart cleared successfully', 200);
  }

  @Delete('/:medicineId')
  async removeFromCart(
    @User('id') userId: string,
    @Param('medicineId') medicineId: string,
  ) {
    const data = await this.cartsService.removeItemFromCart(userId, medicineId);
    return res(data, 'Item removed from cart successfully', 200);
  }
}

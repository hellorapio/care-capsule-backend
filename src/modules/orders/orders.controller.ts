import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dtos/order.dto';
import { res } from 'src/utils/utils';
import User from 'src/decorators/User.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/')
  async getUserOrders(@User('id') userId: string) {
    const data = await this.ordersService.getUserOrders(userId);
    return res(data, 'User orders retrieved successfully', 200);
  }

  @Get('/:id')
  async getOrderById(@Param('id') id: string) {
    const data = await this.ordersService.getOrderWithItems(id);
    return res(data, 'Order retrieved successfully', 200);
  }

  @Post('/')
  async createOrder(
    @User('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const data = await this.ordersService.createOrderFromCart(
      userId,
      createOrderDto,
    );
    return res(data, 'Order created successfully', 201);
  }

  @Patch('/:id')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateOrderStatus(
      id,
      updateStatusDto,
    );
    return res(data, 'Order status updated successfully', 200);
  }
}

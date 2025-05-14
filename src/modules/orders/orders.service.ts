import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  ordersTable,
  orderItemsTable,
  medicinesTable,
  cartItemsTable,
} from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { CartsService } from '../carts/carts.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dtos/order.dto';

@Injectable()
export class OrdersService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly cartsService: CartsService,
  ) {
    super(ordersTable, con);
  }

  async findById(id: string) {
    const order = await this.findFirst(eq(ordersTable.id, id));
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(userId: string) {
    return this.findManyWithoutFilter(
      eq(ordersTable.userId, userId),
      eq(ordersTable.createdAt, ordersTable.createdAt),
    );
  }

  async getOrderWithItems(orderId: string) {
    const order = await this.findById(orderId);

    const orderItems = await this.con
      .select({
        orderItem: {
          orderId: orderItemsTable.orderId,
          medicineId: orderItemsTable.medicineId,
          quantity: orderItemsTable.quantity,
          price: orderItemsTable.price,
        },
        medicine: {
          id: medicinesTable.id,
          name: medicinesTable.name,
          description: medicinesTable.description,
          image: medicinesTable.image,
        },
      })
      .from(orderItemsTable)
      .innerJoin(
        medicinesTable,
        eq(orderItemsTable.medicineId, medicinesTable.id),
      )
      .where(eq(orderItemsTable.orderId, orderId));

    return {
      order,
      items: orderItems,
    };
  }

  async createOrderFromCart(userId: string, createOrderDto: CreateOrderDto) {
    const cartWithItems = await this.cartsService.getCartWithItems(userId);

    if (cartWithItems.items.length === 0) {
      throw new BadRequestException('Cannot create order with empty cart');
    }

    const result = await this.con.transaction(async (tx) => {
      const [order] = await tx
        .insert(ordersTable)
        .values({
          userId,
          totalAmount: cartWithItems.totalPrice,
          shippingAddress: createOrderDto.shippingAddress,
          paymentMethod: createOrderDto.paymentMethod,
          paymentStatus: 'unpaid',
          status: 'pending',
          notes: createOrderDto.notes,
        })
        .returning();

      const orderItemsToInsert = cartWithItems.items.map((item) => ({
        orderId: order.id,
        medicineId: item.medicine.id,
        quantity: item.quantity,
        price: item.medicine.price,
      }));

      await tx.insert(orderItemsTable).values(orderItemsToInsert);

      await tx
        .delete(cartItemsTable)
        .where(eq(cartItemsTable.cartId, cartWithItems.cart.id as string));

      return order;
    });

    return result;
  }

  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto) {
    await this.findById(id);

    const [updatedOrder] = await this.updateById(id, {
      status: updateDto.status,
      paymentStatus: updateDto.paymentStatus,
      trackingNumber: updateDto.trackingNumber,
    });

    return updatedOrder;
  }

  async getUserOrders(userId: string) {
    const orders = await this.findByUser(userId);

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderWithItems = await this.getOrderWithItems(order.id as string);
        return orderWithItems;
      }),
    );

    return ordersWithItems;
  }
}

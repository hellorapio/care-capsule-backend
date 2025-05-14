import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { cartsTable, cartItemsTable, medicinesTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import DatabaseRepository from 'src/global/database/database.repository';
import { MedicinesService } from '../medicines/medicines.service';
import { AddToCartDto, UpdateCartItemDto } from './dtos/cart.dto';

@Injectable()
export class CartsService extends DatabaseRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase,
    private readonly medicinesService: MedicinesService,
  ) {
    super(cartsTable, con);
  }

  async findOrCreateCart(userId: string) {
    let cart = await this.findFirst(eq(cartsTable.userId, userId));

    if (!cart) {
      cart = await this.create({
        userId,
        isActive: true,
      });
    }

    return cart;
  }

  async getCartWithItems(userId: string) {
    const cart = await this.findOrCreateCart(userId);

    const cartItems = await this.con
      .select({
        quantity: cartItemsTable.quantity,
        medicine: {
          id: medicinesTable.id,
          name: medicinesTable.name,
          description: medicinesTable.description,
          price: medicinesTable.price,
          image: medicinesTable.image,
        },
      })
      .from(cartItemsTable)
      .innerJoin(
        medicinesTable,
        eq(cartItemsTable.medicineId, medicinesTable.id),
      )
      .where(eq(cartItemsTable.cartId, cart.id));

    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += Number(item.medicine.price) * item.quantity;
    });

    return {
      cart,
      items: cartItems,
      totalPrice: totalPrice.toFixed(2),
      itemCount: cartItems.length,
    };
  }

  async addItemToCart(userId: string, addToCartDto: AddToCartDto) {
    const cart = await this.findOrCreateCart(userId);

    await this.medicinesService.findById(addToCartDto.medicineId);

    const existingItem = await this.con
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cartId, cart.id),
          eq(cartItemsTable.medicineId, addToCartDto.medicineId),
        ),
      )
      .limit(1);

    if (existingItem.length > 0) {
      const newQuantity =
        existingItem[0].quantity + (addToCartDto.quantity || 1);

      const [updatedItem] = await this.con
        .update(cartItemsTable)
        .set({ quantity: newQuantity })
        .where(
          and(
            eq(cartItemsTable.cartId, cart.id),
            eq(cartItemsTable.medicineId, addToCartDto.medicineId),
          ),
        )
        .returning();

      return updatedItem;
    } else {
      const [newItem] = await this.con
        .insert(cartItemsTable)
        .values({
          cartId: cart.id,
          medicineId: addToCartDto.medicineId,
          quantity: addToCartDto.quantity || 1,
        })
        .returning();

      return newItem;
    }
  }

  async updateCartItem(
    userId: string,
    medicineId: string,
    updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.findFirst(eq(cartsTable.userId, userId));
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const existingItem = await this.con
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cartId, cart.id),
          eq(cartItemsTable.medicineId, medicineId),
        ),
      )
      .limit(1);

    if (existingItem.length === 0) {
      throw new NotFoundException('Item not found in cart');
    }

    if (updateDto.quantity === 0) {
      return this.removeItemFromCart(userId, medicineId);
    }

    const [updatedItem] = await this.con
      .update(cartItemsTable)
      .set({ quantity: updateDto.quantity })
      .where(
        and(
          eq(cartItemsTable.cartId, cart.id),
          eq(cartItemsTable.medicineId, medicineId),
        ),
      )
      .returning();

    return updatedItem;
  }

  async removeItemFromCart(userId: string, medicineId: string) {
    const cart = await this.findFirst(eq(cartsTable.userId, userId));

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }


    
    const deletedItem = await this.con
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.cartId, cart.id),
          eq(cartItemsTable.medicineId, medicineId),
        ),
      )
      .returning();

    return deletedItem;
  }

  async clearCart(userId: string) {
    const cart = await this.findFirst(eq(cartsTable.userId, userId));
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.con
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cart.id));

    return {};
  }
}

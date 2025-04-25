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
    // Try to find existing cart
    let cart = await this.findFirst(eq(cartsTable.userId, userId));

    // If no cart exists, create one
    if (!cart) {
      cart = await this.create({
        userId,
        isActive: true,
      });
    }

    return cart;
  }

  async getCartWithItems(userId: string) {
    // Find or create cart
    const cart = await this.findOrCreateCart(userId);

    // Get cart items with medicine details
    const cartItems = await this.con
      .select({
        cartItem: {
          cartId: cartItemsTable.cartId,
          medicineId: cartItemsTable.medicineId,
          quantity: cartItemsTable.quantity,
        },
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

    // Calculate total price
    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += Number(item.medicine.price) * item.cartItem.quantity;
    });

    return {
      cart,
      items: cartItems,
      totalPrice: totalPrice.toFixed(2),
      itemCount: cartItems.length,
    };
  }

  async addItemToCart(userId: string, addToCartDto: AddToCartDto) {
    // Find or create cart
    const cart = await this.findOrCreateCart(userId);

    // Verify medicine exists
    await this.medicinesService.findById(addToCartDto.medicineId);

    // Check if item already in cart
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
      // Update quantity if item exists
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
      // Add new item to cart
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
    // Find cart
    const cart = await this.findFirst(eq(cartsTable.userId, userId));
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Check if item exists in cart
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

    // If quantity is 0, remove item
    if (updateDto.quantity === 0) {
      return this.removeItemFromCart(userId, medicineId);
    }

    // Update item quantity
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
    // Find cart
    const cart = await this.findFirst(eq(cartsTable.userId, userId));
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Remove item from cart
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
    // Find cart
    const cart = await this.findFirst(eq(cartsTable.userId, userId));
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Remove all items from cart
    await this.con
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.cartId, cart.id));

    return { message: 'Cart cleared successfully' };
  }
}

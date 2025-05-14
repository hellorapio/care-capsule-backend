import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { medicinesTable, wishlistTable } from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import { AddToWishlistDto } from './dtos/wishlist.dto';
import DatabaseRepository from 'src/global/database/database.repository';

@Injectable()
export class WishlistService extends DatabaseRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly con: DrizzleDatabase) {
    super(wishlistTable, con);
  }

  async getWishlist(userId: string) {
    const items = await this.con
      .select({
        medicine: {
          id: medicinesTable.id,
          name: medicinesTable.name,
          description: medicinesTable.description,
          price: medicinesTable.price,
          image: medicinesTable.image,
        },
      })
      .from(wishlistTable)
      .innerJoin(
        medicinesTable,
        eq(wishlistTable.medicineId, medicinesTable.id),
      )
      .where(eq(wishlistTable.userId, userId));

    return items.map((item) => item.medicine);
  }

  async addToWishlist(userId: string, dto: AddToWishlistDto) {
    const existing = await this.con
      .select()
      .from(wishlistTable)
      .where(
        and(
          eq(wishlistTable.userId, userId),
          eq(wishlistTable.medicineId, dto.medicineId),
        ),
      )
      .limit(1);

    if (existing.length > 0) return { message: 'Already in wishlist' };

    const [inserted] = await this.con
      .insert(wishlistTable)
      .values({
        userId,
        medicineId: dto.medicineId,
      })
      .returning();

    return inserted;
  }

  async removeFromWishlist(userId: string, medicineId: string) {
    const [deleted] = await this.con
      .delete(wishlistTable)
      .where(
        and(
          eq(wishlistTable.userId, userId),
          eq(wishlistTable.medicineId, medicineId),
        ),
      )
      .returning();

    if (!deleted) throw new NotFoundException('Item not found in wishlist');

    return deleted;
  }
}

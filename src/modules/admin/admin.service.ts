//@ts-nocheck
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, desc, count, and, like, ilike } from 'drizzle-orm';
import {
  usersTable,
  medicinesTable,
  ordersTable,
  reviewsTable,
  pharmaciesTable,
  pharmacyMedicinesTable,
} from 'src/drizzle/schema';
import {
  DRIZZLE_DB,
  DrizzleDatabase,
} from 'src/global/database/database.module';
import { UploadService } from 'src/global/upload/upload.service';

export interface CreateMedicineDto {
  name: string;
  price: string;
  description?: string;
  image?: string;
  substance?: string;
  category?: string;
  stock?: boolean;
}

export interface UpdateMedicineDto {
  name?: string;
  price?: string;
  description?: string;
  image?: string;
  substance?: string;
  category?: string;
  stock?: boolean;
}

@Injectable()
export class AdminService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
    private readonly uploadService: UploadService,
  ) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalMedicines,
      totalOrders,
      totalPharmacies,
      totalReviews,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(usersTable),
      this.db.select({ count: count() }).from(medicinesTable),
      this.db.select({ count: count() }).from(ordersTable),
      this.db.select({ count: count() }).from(pharmaciesTable),
      this.db.select({ count: count() }).from(reviewsTable),
    ]);

    return {
      users: totalUsers[0].count,
      medicines: totalMedicines[0].count,
      orders: totalOrders[0].count,
      pharmacies: totalPharmacies[0].count,
      reviews: totalReviews[0].count,
    };
  }

  // User Management
  async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    let users;
    let totalUsers;

    if (search) {
      users = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          image: usersTable.image,
          gender: usersTable.gender,
          phone: usersTable.phone,
          address: usersTable.address,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .where(like(usersTable.name, `%${search}%`))
        .orderBy(desc(usersTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalUsers = await this.db
        .select({ count: count() })
        .from(usersTable)
        .where(like(usersTable.name, `%${search}%`));
    } else {
      users = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          image: usersTable.image,
          gender: usersTable.gender,
          phone: usersTable.phone,
          address: usersTable.address,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalUsers = await this.db.select({ count: count() }).from(usersTable);
    }

    return {
      users,
      total: totalUsers[0].count,
      page,
      limit,
      totalPages: Math.ceil(totalUsers[0].count / limit),
    };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.id, userId))
      .returning();

    return user[0];
  }

  async deleteUser(userId: string) {
    await this.db.delete(usersTable).where(eq(usersTable.id, userId));
    return { message: 'User deleted successfully' };
  }

  // Medicine Management
  async getAllMedicinesAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
  ) {
    const offset = (page - 1) * limit;

    let medicines;
    let totalMedicines;

    if (search && category) {
      medicines = await this.db
        .select()
        .from(medicinesTable)
        .where(
          and(
            ilike(medicinesTable.name, `%${search}%`),
            eq(medicinesTable.category, category),
          ),
        )
        .orderBy(desc(medicinesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalMedicines = await this.db
        .select({ count: count() })
        .from(medicinesTable)
        .where(
          and(
            ilike(medicinesTable.name, `%${search}%`),
            eq(medicinesTable.category, category),
          ),
        );
    } else if (search) {
      medicines = await this.db
        .select()
        .from(medicinesTable)
        .where(ilike(medicinesTable.name, `%${search}%`))
        .orderBy(desc(medicinesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalMedicines = await this.db
        .select({ count: count() })
        .from(medicinesTable)
        .where(ilike(medicinesTable.name, `%${search}%`));
    } else if (category) {
      medicines = await this.db
        .select()
        .from(medicinesTable)
        .where(eq(medicinesTable.category, category))
        .orderBy(desc(medicinesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalMedicines = await this.db
        .select({ count: count() })
        .from(medicinesTable)
        .where(eq(medicinesTable.category, category));
    } else {
      medicines = await this.db
        .select()
        .from(medicinesTable)
        .orderBy(desc(medicinesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalMedicines = await this.db
        .select({ count: count() })
        .from(medicinesTable);
    }

    return {
      medicines,
      total: totalMedicines[0].count,
      page,
      limit,
      totalPages: Math.ceil(totalMedicines[0].count / limit),
    };
  }
  async createMedicine(medicineData: CreateMedicineDto) {
    const medicine = await this.db
      .insert(medicinesTable)
      .values(medicineData)
      .returning();

    return medicine[0];
  }

  async updateMedicine(medicineId: string, medicineData: UpdateMedicineDto) {
    const medicine = await this.db
      .update(medicinesTable)
      .set(medicineData)
      .where(eq(medicinesTable.id, medicineId))
      .returning();

    return medicine[0];
  }

  async updateMedicineImage(medicineId: string, file: Express.Multer.File) {
    // Find the medicine first
    const existingMedicine = await this.db
      .select()
      .from(medicinesTable)
      .where(eq(medicinesTable.id, medicineId))
      .limit(1);

    if (!existingMedicine[0]) {
      throw new NotFoundException('Medicine not found');
    }

    // Upload the image
    const uploadResult = await this.uploadService.uploadToBucket(file);

    // Update the medicine with the new image URL
    const medicine = await this.db
      .update(medicinesTable)
      .set({ image: uploadResult })
      .where(eq(medicinesTable.id, medicineId))
      .returning();

    return medicine[0];
  }

  async deleteMedicine(medicineId: string) {
    await this.db
      .delete(medicinesTable)
      .where(eq(medicinesTable.id, medicineId));
    return { message: 'Medicine deleted successfully' };
  }

  // Order Management
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    paymentStatus?: string,
  ) {
    const offset = (page - 1) * limit;

    let orders;
    let totalOrders;

    if (status && paymentStatus) {
      orders = await this.db
        .select({
          id: ordersTable.id,
          status: ordersTable.status,
          totalAmount: ordersTable.totalAmount,
          shippingAddress: ordersTable.shippingAddress,
          paymentMethod: ordersTable.paymentMethod,
          paymentStatus: ordersTable.paymentStatus,
          trackingNumber: ordersTable.trackingNumber,
          createdAt: ordersTable.createdAt,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(ordersTable)
        .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .where(
          and(
            eq(ordersTable.status, status),
            eq(ordersTable.paymentStatus, paymentStatus),
          ),
        )
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalOrders = await this.db
        .select({ count: count() })
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.status, status),
            eq(ordersTable.paymentStatus, paymentStatus),
          ),
        );
    } else if (status) {
      orders = await this.db
        .select({
          id: ordersTable.id,
          status: ordersTable.status,
          totalAmount: ordersTable.totalAmount,
          shippingAddress: ordersTable.shippingAddress,
          paymentMethod: ordersTable.paymentMethod,
          paymentStatus: ordersTable.paymentStatus,
          trackingNumber: ordersTable.trackingNumber,
          createdAt: ordersTable.createdAt,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(ordersTable)
        .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .where(eq(ordersTable.status, status))
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalOrders = await this.db
        .select({ count: count() })
        .from(ordersTable)
        .where(eq(ordersTable.status, status));
    } else if (paymentStatus) {
      orders = await this.db
        .select({
          id: ordersTable.id,
          status: ordersTable.status,
          totalAmount: ordersTable.totalAmount,
          shippingAddress: ordersTable.shippingAddress,
          paymentMethod: ordersTable.paymentMethod,
          paymentStatus: ordersTable.paymentStatus,
          trackingNumber: ordersTable.trackingNumber,
          createdAt: ordersTable.createdAt,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(ordersTable)
        .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .where(eq(ordersTable.paymentStatus, paymentStatus))
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalOrders = await this.db
        .select({ count: count() })
        .from(ordersTable)
        .where(eq(ordersTable.paymentStatus, paymentStatus));
    } else {
      orders = await this.db
        .select({
          id: ordersTable.id,
          status: ordersTable.status,
          totalAmount: ordersTable.totalAmount,
          shippingAddress: ordersTable.shippingAddress,
          paymentMethod: ordersTable.paymentMethod,
          paymentStatus: ordersTable.paymentStatus,
          trackingNumber: ordersTable.trackingNumber,
          createdAt: ordersTable.createdAt,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(ordersTable)
        .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalOrders = await this.db.select({ count: count() }).from(ordersTable);
    }

    return {
      orders,
      total: totalOrders[0].count,
      page,
      limit,
      totalPages: Math.ceil(totalOrders[0].count / limit),
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return order[0];
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const order = await this.db
      .update(ordersTable)
      .set({ paymentStatus })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return order[0];
  }

  // Review Management
  async getAllReviews(
    page: number = 1,
    limit: number = 10,
    pharmacyId?: string,
  ) {
    const offset = (page - 1) * limit;

    let reviews;
    let totalReviews;

    if (pharmacyId) {
      reviews = await this.db
        .select({
          id: reviewsTable.id,
          rating: reviewsTable.rating,
          comment: reviewsTable.comment,
          createdAt: reviewsTable.createdAt,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
          pharmacy: {
            id: pharmaciesTable.id,
            name: pharmaciesTable.name,
          },
        })
        .from(reviewsTable)
        .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
        .leftJoin(
          pharmaciesTable,
          eq(reviewsTable.pharmacyId, pharmaciesTable.id),
        )
        .where(eq(reviewsTable.pharmacyId, pharmacyId))
        .orderBy(desc(reviewsTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalReviews = await this.db
        .select({ count: count() })
        .from(reviewsTable)
        .where(eq(reviewsTable.pharmacyId, pharmacyId));
    } else {
      reviews = await this.db
        .select({
          id: reviewsTable.id,
          rating: reviewsTable.rating,
          comment: reviewsTable.comment,
          createdAt: reviewsTable.createdAt,
          user: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
          pharmacy: {
            id: pharmaciesTable.id,
            name: pharmaciesTable.name,
          },
        })
        .from(reviewsTable)
        .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id))
        .leftJoin(
          pharmaciesTable,
          eq(reviewsTable.pharmacyId, pharmaciesTable.id),
        )
        .orderBy(desc(reviewsTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalReviews = await this.db
        .select({ count: count() })
        .from(reviewsTable);
    }

    return {
      reviews,
      total: totalReviews[0].count,
      page,
      limit,
      totalPages: Math.ceil(totalReviews[0].count / limit),
    };
  }

  async deleteReview(reviewId: string) {
    await this.db.delete(reviewsTable).where(eq(reviewsTable.id, reviewId));
    return { message: 'Review deleted successfully' };
  }

  // Pharmacy Management
  async getAllPharmaciesAdmin(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ) {
    const offset = (page - 1) * limit;

    let pharmacies;
    let totalPharmacies;

    if (search && isActive !== undefined) {
      pharmacies = await this.db
        .select({
          id: pharmaciesTable.id,
          name: pharmaciesTable.name,
          description: pharmaciesTable.description,
          address: pharmaciesTable.address,
          phone: pharmaciesTable.phone,
          email: pharmaciesTable.email,
          image: pharmaciesTable.image,
          isActive: pharmaciesTable.isActive,
          createdAt: pharmaciesTable.createdAt,
          owner: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(pharmaciesTable)
        .leftJoin(usersTable, eq(pharmaciesTable.ownerId, usersTable.id))
        .where(
          and(
            ilike(pharmaciesTable.name, `%${search}%`),
            eq(pharmaciesTable.isActive, isActive),
          ),
        )
        .orderBy(desc(pharmaciesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalPharmacies = await this.db
        .select({ count: count() })
        .from(pharmaciesTable)
        .where(
          and(
            ilike(pharmaciesTable.name, `%${search}%`),
            eq(pharmaciesTable.isActive, isActive),
          ),
        );
    } else if (search) {
      pharmacies = await this.db
        .select({
          id: pharmaciesTable.id,
          name: pharmaciesTable.name,
          description: pharmaciesTable.description,
          address: pharmaciesTable.address,
          phone: pharmaciesTable.phone,
          email: pharmaciesTable.email,
          image: pharmaciesTable.image,
          isActive: pharmaciesTable.isActive,
          createdAt: pharmaciesTable.createdAt,
          owner: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(pharmaciesTable)
        .leftJoin(usersTable, eq(pharmaciesTable.ownerId, usersTable.id))
        .where(ilike(pharmaciesTable.name, `%${search}%`))
        .orderBy(desc(pharmaciesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalPharmacies = await this.db
        .select({ count: count() })
        .from(pharmaciesTable)
        .where(ilike(pharmaciesTable.name, `%${search}%`));
    } else if (isActive !== undefined) {
      pharmacies = await this.db
        .select({
          id: pharmaciesTable.id,
          name: pharmaciesTable.name,
          description: pharmaciesTable.description,
          address: pharmaciesTable.address,
          phone: pharmaciesTable.phone,
          email: pharmaciesTable.email,
          image: pharmaciesTable.image,
          isActive: pharmaciesTable.isActive,
          createdAt: pharmaciesTable.createdAt,
          owner: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(pharmaciesTable)
        .leftJoin(usersTable, eq(pharmaciesTable.ownerId, usersTable.id))
        .where(eq(pharmaciesTable.isActive, isActive))
        .orderBy(desc(pharmaciesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalPharmacies = await this.db
        .select({ count: count() })
        .from(pharmaciesTable)
        .where(eq(pharmaciesTable.isActive, isActive));
    } else {
      pharmacies = await this.db
        .select({
          id: pharmaciesTable.id,
          name: pharmaciesTable.name,
          description: pharmaciesTable.description,
          address: pharmaciesTable.address,
          phone: pharmaciesTable.phone,
          email: pharmaciesTable.email,
          image: pharmaciesTable.image,
          isActive: pharmaciesTable.isActive,
          createdAt: pharmaciesTable.createdAt,
          owner: {
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
          },
        })
        .from(pharmaciesTable)
        .leftJoin(usersTable, eq(pharmaciesTable.ownerId, usersTable.id))
        .orderBy(desc(pharmaciesTable.createdAt))
        .limit(limit)
        .offset(offset);

      totalPharmacies = await this.db
        .select({ count: count() })
        .from(pharmaciesTable);
    }

    return {
      pharmacies,
      total: totalPharmacies[0].count,
      page,
      limit,
      totalPages: Math.ceil(totalPharmacies[0].count / limit),
    };
  }

  async togglePharmacyStatus(pharmacyId: string) {
    const pharmacy = await this.db
      .select()
      .from(pharmaciesTable)
      .where(eq(pharmaciesTable.id, pharmacyId))
      .limit(1);

    if (!pharmacy[0]) {
      throw new Error('Pharmacy not found');
    }

    const updatedPharmacy = await this.db
      .update(pharmaciesTable)
      .set({ isActive: !pharmacy[0].isActive })
      .where(eq(pharmaciesTable.id, pharmacyId))
      .returning();

    return updatedPharmacy[0];
  }

  // Analytics
  async getOrderAnalytics() {
    const orderStats = await this.db
      .select({
        status: ordersTable.status,
        count: count(),
      })
      .from(ordersTable)
      .groupBy(ordersTable.status);

    const revenueByMonth = await this.db
      .select({
        month: ordersTable.createdAt,
        revenue: ordersTable.totalAmount,
      })
      .from(ordersTable)
      .where(eq(ordersTable.paymentStatus, 'paid'))
      .orderBy(desc(ordersTable.createdAt));

    return {
      orderStats,
      revenueByMonth,
    };
  }

  // Advanced Reports
  async getUsersReport() {
    const usersByRole = await this.db
      .select({
        role: usersTable.role,
        count: count(),
      })
      .from(usersTable)
      .groupBy(usersTable.role);

    const recentUsers = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(10);

    return {
      usersByRole,
      recentUsers,
      totalUsers: usersByRole.reduce((acc, curr) => acc + curr.count, 0),
    };
  }

  async getRevenueReport(period: string = 'month') {
    let dateFilter = '';

    switch (period) {
      case 'week':
        dateFilter = "WHERE created_at >= NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "WHERE created_at >= NOW() - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "WHERE created_at >= NOW() - INTERVAL '1 year'";
        break;
      default:
        dateFilter = "WHERE created_at >= NOW() - INTERVAL '30 days'";
    }

    const totalRevenue = await this.db
      .select({
        total: ordersTable.totalAmount,
      })
      .from(ordersTable)
      .where(eq(ordersTable.paymentStatus, 'paid'));

    const revenueSum = totalRevenue.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    return {
      totalRevenue: revenueSum,
      period,
      orders: totalRevenue.length,
    };
  }

  async getMedicinesReport() {
    const medicinesByCategory = await this.db
      .select({
        category: medicinesTable.category,
        count: count(),
      })
      .from(medicinesTable)
      .groupBy(medicinesTable.category);

    const stockStatus = await this.db
      .select({
        stock: medicinesTable.stock,
        count: count(),
      })
      .from(medicinesTable)
      .groupBy(medicinesTable.stock);

    return {
      medicinesByCategory,
      stockStatus,
      totalMedicines: medicinesByCategory.reduce(
        (acc, curr) => acc + curr.count,
        0,
      ),
    };
  }

  async getPharmaciesReport() {
    const pharmaciesByStatus = await this.db
      .select({
        isActive: pharmaciesTable.isActive,
        count: count(),
      })
      .from(pharmaciesTable)
      .groupBy(pharmaciesTable.isActive);

    const recentPharmacies = await this.db
      .select({
        id: pharmaciesTable.id,
        name: pharmaciesTable.name,
        isActive: pharmaciesTable.isActive,
        createdAt: pharmaciesTable.createdAt,
      })
      .from(pharmaciesTable)
      .orderBy(desc(pharmaciesTable.createdAt))
      .limit(10);

    return {
      pharmaciesByStatus,
      recentPharmacies,
      totalPharmacies: pharmaciesByStatus.reduce(
        (acc, curr) => acc + curr.count,
        0,
      ),
    };
  }
  // Bulk Operations
  async bulkUpdateUsers(userIds: string[], updateData: any) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.db
        .update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, userId))
        .returning();
      if (result[0]) results.push(result[0]);
    }
    return results;
  }

  async bulkUpdateMedicines(medicineIds: string[], updateData: any) {
    const results = [];
    for (const medicineId of medicineIds) {
      const result = await this.db
        .update(medicinesTable)
        .set(updateData)
        .where(eq(medicinesTable.id, medicineId))
        .returning();
      if (result[0]) results.push(result[0]);
    }
    return results;
  }

  async bulkUpdatePharmacies(pharmacyIds: string[], updateData: any) {
    const results = [];
    for (const pharmacyId of pharmacyIds) {
      const result = await this.db
        .update(pharmaciesTable)
        .set(updateData)
        .where(eq(pharmaciesTable.id, pharmacyId))
        .returning();
      if (result[0]) results.push(result[0]);
    }
    return results;
  }

  // Detailed Views
  async getUserDetails(userId: string) {
    const user = await this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        image: usersTable.image,
        gender: usersTable.gender,
        phone: usersTable.phone,
        address: usersTable.address,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new NotFoundException('User not found');
    }

    // Get user's orders
    const orders = await this.db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        totalAmount: ordersTable.totalAmount,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);

    // Get user's reviews
    const reviews = await this.db
      .select({
        id: reviewsTable.id,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        createdAt: reviewsTable.createdAt,
        pharmacy: {
          id: pharmaciesTable.id,
          name: pharmaciesTable.name,
        },
      })
      .from(reviewsTable)
      .leftJoin(
        pharmaciesTable,
        eq(reviewsTable.pharmacyId, pharmaciesTable.id),
      )
      .where(eq(reviewsTable.userId, userId))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(10);

    return {
      user: user[0],
      orders,
      reviews,
      orderCount: orders.length,
      reviewCount: reviews.length,
    };
  }

  async getOrderDetails(orderId: string) {
    const order = await this.db
      .select({
        id: ordersTable.id,
        status: ordersTable.status,
        totalAmount: ordersTable.totalAmount,
        shippingAddress: ordersTable.shippingAddress,
        paymentMethod: ordersTable.paymentMethod,
        paymentStatus: ordersTable.paymentStatus,
        trackingNumber: ordersTable.trackingNumber,
        notes: ordersTable.notes,
        createdAt: ordersTable.createdAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        },
      })
      .from(ordersTable)
      .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order[0]) {
      throw new NotFoundException('Order not found');
    }

    return order[0];
  }

  async getPharmacyMedicines(pharmacyId: string) {
    const medicines = await this.db
      .select({
        medicine: {
          id: medicinesTable.id,
          name: medicinesTable.name,
          description: medicinesTable.description,
          price: medicinesTable.price,
          image: medicinesTable.image,
          category: medicinesTable.category,
          stock: medicinesTable.stock,
        },
        pharmacyMedicine: pharmacyMedicinesTable,
      })
      .from(pharmacyMedicinesTable)
      .innerJoin(
        medicinesTable,
        eq(pharmacyMedicinesTable.medicineId, medicinesTable.id),
      )
      .where(eq(pharmacyMedicinesTable.pharmacyId, pharmacyId))
      .orderBy(desc(medicinesTable.createdAt));

    return medicines;
  }

  // Pharmacy Management
  async createPharmacy(pharmacyData: any) {
    const pharmacy = await this.db
      .insert(pharmaciesTable)
      .values(pharmacyData)
      .returning();

    return pharmacy[0];
  }

  async updatePharmacy(pharmacyId: string, pharmacyData: any) {
    const pharmacy = await this.db
      .update(pharmaciesTable)
      .set(pharmacyData)
      .where(eq(pharmaciesTable.id, pharmacyId))
      .returning();

    return pharmacy[0];
  }

  async deletePharmacy(pharmacyId: string) {
    await this.db
      .delete(pharmaciesTable)
      .where(eq(pharmaciesTable.id, pharmacyId));
    return { message: 'Pharmacy deleted successfully' };
  }

  // Configuration
  async getMedicineCategories() {
    const categories = await this.db
      .select({
        category: medicinesTable.category,
        count: count(),
      })
      .from(medicinesTable)
      .groupBy(medicinesTable.category)
      .orderBy(desc(count()));

    return categories.map((c) => c.category).filter(Boolean);
  }
  getOrderStatuses() {
    return [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];
  }
}

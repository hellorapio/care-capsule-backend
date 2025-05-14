import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { APP_GUARD } from '@nestjs/core';
import JwtGuard from './guards/jwt.guard';
import { DatabaseModule } from './global/database/database.module';
import { UploadModule } from './global/upload/upload.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from './global/config/config.module';
import { MeModule } from './modules/me/me.module';
import { PharmaciesModule } from './modules/pharmacies/pharmacies.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartsModule } from './modules/carts/carts.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

@Module({
  imports: [
    DatabaseModule.forRoot(),
    UploadModule.forRoot(),
    UsersModule,
    AuthModule,
    ConfigModule,
    MeModule,
    PharmaciesModule,
    MedicinesModule,
    ReviewsModule,
    OrdersModule,
    CartsModule,
    WishlistModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}

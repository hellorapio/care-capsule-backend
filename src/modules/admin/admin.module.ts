import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { MedicinesModule } from '../medicines/medicines.module';
import { OrdersModule } from '../orders/orders.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PharmaciesModule } from '../pharmacies/pharmacies.module';
import { UploadModule } from 'src/global/upload/upload.module';

@Module({
  imports: [
    UsersModule,
    MedicinesModule,
    OrdersModule,
    ReviewsModule,
    PharmaciesModule,
    UploadModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

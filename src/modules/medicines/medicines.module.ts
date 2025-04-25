import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { CategoriesModule } from '../categories/categories.module';
import { PharmacyMedicinesService } from './pharmacy-medicine.service';
import { PharmaciesModule } from '../pharmacies/pharmacies.module';

@Module({
  imports: [CategoriesModule, PharmaciesModule],
  providers: [MedicinesService, PharmacyMedicinesService],
  exports: [MedicinesService, PharmacyMedicinesService],
  controllers: [MedicinesController],
})
export class MedicinesModule {}

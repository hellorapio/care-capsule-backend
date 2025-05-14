import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { PharmacyMedicinesService } from './pharmacy-medicine.service';
import { PharmaciesModule } from '../pharmacies/pharmacies.module';

@Module({
  imports: [PharmaciesModule],
  providers: [MedicinesService, PharmacyMedicinesService],
  exports: [MedicinesService, PharmacyMedicinesService],
  controllers: [MedicinesController],
})
export class MedicinesModule {}

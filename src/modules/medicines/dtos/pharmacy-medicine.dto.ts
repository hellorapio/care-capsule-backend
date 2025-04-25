import { 
  IsBoolean, 
  IsDecimal, 
  IsInt, 
  IsNotEmpty, 
  IsOptional 
} from 'class-validator';

export class AddMedicineToPharmacyDto {
  @IsNotEmpty()
  @IsDecimal()
  price: string;

  @IsNotEmpty()
  @IsInt()
  stockQuantity: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdatePharmacyMedicineDto {
  @IsOptional()
  @IsDecimal()
  price?: string;

  @IsOptional()
  @IsInt()
  stockQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
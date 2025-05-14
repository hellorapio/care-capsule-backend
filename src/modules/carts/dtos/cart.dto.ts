import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsNotEmpty()
  @IsUUID()
  medicineId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}

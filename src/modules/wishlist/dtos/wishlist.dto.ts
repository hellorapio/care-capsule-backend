import { IsUUID } from 'class-validator';

export class AddToWishlistDto {
  @IsUUID()
  medicineId: string;
}

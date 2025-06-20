import { IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
import { UserRole } from 'src/types';

export default class SignupDTO {
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsIn(['user', 'admin', 'pharmacy_owner'], { message: 'Role must be one of: user, admin, pharmacy_owner' })
  role?: UserRole;
}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import JwtStrategy from './strategies/jwt.strategy';
import RefreshStrategy from './strategies/refresh.strategy';
import { JwtModule } from 'src/global/jwt/jwt.module';

@Module({
  imports: [PassportModule, JwtModule],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

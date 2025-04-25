import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import {
  JwtModule as NestJwtModule,
  JwtService as NestJwtService,
} from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwt.sec'),
          signOptions: {
            expiresIn: configService.get<string>('jwt.accessExp'),
            algorithm: 'HS256',
          },
        };
      },
    }),
  ],
  providers: [JwtService, NestJwtService],
  exports: [JwtService, NestJwtService],
})
export class JwtModule {}

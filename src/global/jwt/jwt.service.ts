import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/types';

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async verify(token: string): Promise<JWTPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('jwt.ref'),
      ignoreExpiration: false,
      algorithms: ['HS256'],
    });
  }

  async generateRefreshToken(sub: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: sub,
        type: 'refresh',
      },
      {
        secret: this.configService.get<string>('jwt.ref'),
        expiresIn: this.configService.get<string>('jwt.refreshExp'),
      },
    );
  }
  async generateAccessToken(sub: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: sub,
        type: 'access',
      },
      {
        secret: this.configService.get<string>('jwt.sec'),
        expiresIn: this.configService.get<string>('jwt.accessExp'),
      },
    );
  }

  async generateAdminToken(sub: string): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: sub,
        type: 'admin',
      },
      {
        secret: this.configService.get<string>('jwt.admin'),
        expiresIn: this.configService.get<string>('jwt.adminExp'),
      },
    );
  }
}

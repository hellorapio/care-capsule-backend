import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { JWTPayload } from 'src/types';

@Injectable()
export default class RefreshStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([RefreshStrategy.body]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.ref')!,
      algorithms: ['HS256'],
    });
  }

  private static body = (req: Request): string | null => {
    const body = req.body as { refresh?: string };
    return body.refresh && body.refresh.length > 0 ? body.refresh : null;
  };

  async validate({ sub, type }: JWTPayload) {
    if (type !== 'refresh') throw new UnauthorizedException('Invalid Token');

    const user = await this.userService.findById(sub);
    if (!user) throw new UnauthorizedException('Invalid Token');
    return user;
  }
}

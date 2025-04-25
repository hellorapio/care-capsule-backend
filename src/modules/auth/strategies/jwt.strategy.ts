import { JWTPayload } from 'src/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/modules/users/users.service';
// import { Request } from "express";

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.sec')!,
      algorithms: ['HS256'],
    });
  }

  async validate({ sub, type }: JWTPayload) {
    if (type !== 'access') throw new UnauthorizedException('Invalid Token');
    const user = await this.userService.findById(sub);
    if (!user) throw new UnauthorizedException('Invalid Token');
    return user;
  }
}

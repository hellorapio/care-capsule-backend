import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export default class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>(
      'Roles',
      [context.getHandler(), context.getClass()],
    );

    if (!roles) return true;

    const { user } = context.switchToHttp().getRequest<Request>();
    if (!user.role) {
      throw new UnauthorizedException('Roles Guard: User has no role assigned');
    }
    if (user.role === 'super-admin' || roles.includes(user.role)) return true;
    throw new UnauthorizedException(
      'Roles Guard: User does not have the required role',
    );
  }
}

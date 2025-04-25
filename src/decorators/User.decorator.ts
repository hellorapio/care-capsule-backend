import { Request } from 'express';
import { User } from './../types';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

const User = createParamDecorator(
  (property: keyof User | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<Request>();
    return property ? (user[property]) : user;
  },
);

export default User;

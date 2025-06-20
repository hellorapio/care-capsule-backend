import { usersTable } from 'src/drizzle/schema';

export type JWTPayload = {
  type: 'access' | 'refresh' | 'admin';
  iat: number;
  exp: number;
  sub: string;
};

export type User = typeof usersTable.$inferSelect;

export type UserRole = 'user' | 'admin' | 'pharmacy_owner';

declare module 'express' {
  interface Request {
    user: User;
  }
}

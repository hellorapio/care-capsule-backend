import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { eq, and, gt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DrizzleDatabase } from 'src/global/database/database.module';
import {
  cartsTable,
  userSettingsTable,
  usersTable,
  verificationsTable,
} from 'src/drizzle/schema';
import { JwtService } from 'src/global/jwt/jwt.service';
import { otpCode } from 'src/utils/utils';
import { ResetDto, VerifyDto } from './dtos/reset-pass.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: DrizzleDatabase,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = {
      access: await this.jwtService.generateAccessToken(user.id),
      refresh: await this.jwtService.generateRefreshToken(user.id),
    };

    await this.db
      .update(usersTable)
      .set({ refresh: tokens.refresh })
      .where(eq(usersTable.id, user.id));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { tokens, user: userWithoutPassword };
  }

  async signup(name: string, email: string, password: string) {
    const existingUser = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.db
      .insert(usersTable)
      .values({
        name,
        email,
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    const user = newUser[0];
    const tokens = {
      access: await this.jwtService.generateAccessToken(user.id),
      refresh: await this.jwtService.generateRefreshToken(user.id),
    };

    await this.db
      .update(usersTable)
      .set({ refresh: tokens.refresh })
      .where(eq(usersTable.id, user.id));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return { tokens, user: userWithoutPassword };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwtService.verify(refreshToken);

    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, payload.sub),
    });

    if (!user || user.refresh !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = {
      access: await this.jwtService.generateAccessToken(user.id),
      refresh: await this.jwtService.generateRefreshToken(user.id),
    };

    await this.db
      .update(usersTable)
      .set({ refresh: tokens.refresh })
      .where(eq(usersTable.id, user.id));

    return tokens;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Find the user
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.db
      .update(usersTable)
      .set({
        password: hashedPassword,
      })
      .where(eq(usersTable.id, userId));

    return { message: 'Password updated successfully' };
  }

  async forgotPass(email: string) {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.db
      .delete(verificationsTable)
      .where(eq(verificationsTable.userId, user.id));

    const code = await this.db
      .insert(verificationsTable)
      .values({
        userId: user.id,
        code: `${otpCode()}`,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      })
      .returning();

    return code[0];
  }

  async verify(verify: VerifyDto) {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, verify.email),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = await this.db
      .select()
      .from(verificationsTable)
      .where(
        and(
          eq(verificationsTable.userId, user.id),
          eq(verificationsTable.code, verify.code),
          gt(verificationsTable.expiresAt, new Date()),
        ),
      );

    if (!code[0])
      throw new NotFoundException('Code might be invalid or expired');

    return code[0];
  }

  async resetPass(reset: ResetDto) {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, reset.email),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const code = await this.db
      .select()
      .from(verificationsTable)
      .where(
        and(
          eq(verificationsTable.userId, user.id),
          eq(verificationsTable.code, reset.code),
          gt(verificationsTable.expiresAt, new Date()),
        ),
      );

    if (!code[0])
      throw new NotFoundException('Code might be invalid or expired');

    const hashedPassword = await bcrypt.hash(reset.password, 10);
    await this.db
      .update(usersTable)
      .set({
        password: hashedPassword,
      })
      .where(eq(usersTable.id, user.id));

    await this.db
      .delete(verificationsTable)
      .where(eq(verificationsTable.userId, user.id));

    return code[0];
  }

  async createUserSettings(userId: string) {
    await this.db.insert(userSettingsTable).values({
      userId,
    });
  }

  async createUserCart(userId: string) {
    await this.db.insert(cartsTable).values({
      userId,
    });
  }
}

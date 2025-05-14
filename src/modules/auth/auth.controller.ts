import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Patch,
} from '@nestjs/common';
import Public from 'src/decorators/Public.decorator';
import { AuthService } from './auth.service';
import RefreshJwtGuard from 'src/guards/refresh.guard';
import LoginDTO from './dtos/login.dto';
import SignupDTO from './dtos/signup.dto';
import RefreshDTO from './dtos/refresh.dto';
import ChangePasswordDTO from './dtos/change-password.dto';
import User from 'src/decorators/User.decorator';
import { res } from 'src/utils/utils';
import { ForgotDto, ResetDto, VerifyDto } from './dtos/reset-pass.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDTO) {
    const { tokens, user } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return res({ tokens, user }, 'Logged in successfully', 200);
  }

  @Post('/signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDTO) {
    const { tokens, user } = await this.authService.signup(
      signupDto.name,
      signupDto.email,
      signupDto.password,
    );

    await this.authService.createUserSettings(user.id);
    await this.authService.createUserCart(user.id);
    return res({ tokens, user }, 'User created successfully', 201);
  }

  @Post('/forgot')
  @Public()
  @HttpCode(HttpStatus.OK)
  async forgot(@Body() forgotDto: ForgotDto) {
    const code = await this.authService.forgotPass(forgotDto.email);
    return res({ code: code.code }, 'Code Requested successfully', 201);
  }

  @Post('/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verify(@Body() verifyDto: VerifyDto) {
    await this.authService.verify(verifyDto);
    return res({}, 'Code Verified successfully', 201);
  }

  @Post('/reset')
  @Public()
  @HttpCode(HttpStatus.OK)
  async reset(@Body() resetDto: ResetDto) {
    await this.authService.resetPass(resetDto);
    return res({}, 'Password Resetted successfully', 201);
  }

  @Post('/refresh')
  @Public()
  @UseGuards(RefreshJwtGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDTO) {
    return res(
      { tokens: await this.authService.refresh(refreshDto.refresh) },
      'Token refreshed successfully',
    );
  }

  @Patch('/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @User('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDTO,
  ) {
    await this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    return res({}, 'Password changed successfully');
  }
}

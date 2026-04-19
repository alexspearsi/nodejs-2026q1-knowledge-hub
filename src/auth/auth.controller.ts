import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto/signup.dto';
import { Response } from 'express';
import { JwtGuard } from './guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AuthRequestDto,
  ) {
    return await this.authService.signup(res, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  async signin(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AuthRequestDto,
  ) {
    return await this.authService.login(res, dto);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: { id: string }) {
    return await this.authService.logout(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    return await this.authService.refresh(body.refreshToken);
  }
}

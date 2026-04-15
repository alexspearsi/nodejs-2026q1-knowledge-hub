import { Body, Controller, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Post } from '@nestjs/common';
import { SignupRequestDto } from './dto/signup.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: SignupRequestDto,
  ) {
    return await this.authService.signup(res, dto);
  }
}

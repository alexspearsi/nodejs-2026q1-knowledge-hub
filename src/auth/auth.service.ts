import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRequestDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  JwtPayload as AppJwtPayload,
  JwtPayload,
} from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  private readonly TOKEN_EXPIRE_TIME;
  private readonly TOKEN_REFRESH_EXPIRE_TIME;
  private readonly CRYPT_SALT;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.TOKEN_EXPIRE_TIME = this.configService.getOrThrow('TOKEN_EXPIRE_TIME');
    this.TOKEN_REFRESH_EXPIRE_TIME = this.configService.getOrThrow(
      'TOKEN_REFRESH_EXPIRE_TIME',
    );
    this.CRYPT_SALT = Number(this.configService.getOrThrow('CRYPT_SALT'));
  }

  async signup(res: Response, dto: AuthRequestDto) {
    const { login, password } = dto;

    const existUser = await this.prismaService.user.findUnique({
      where: {
        login,
      },
    });

    if (existUser) {
      throw new BadRequestException('Login already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.CRYPT_SALT);

    await this.prismaService.user.create({
      data: {
        login,
        password: hashedPassword,
      },
    });

    return { message: 'User signed up' };
  }

  async login(res: Response, dto: AuthRequestDto) {
    const { login, password } = dto;

    const existUser = await this.prismaService.user.findUnique({
      where: {
        login,
      },
    });

    if (!existUser) {
      throw new ForbiddenException('Credentials are not correct');
    }

    const isValidPassword = await bcrypt.compare(password, existUser.password);

    if (!isValidPassword) {
      throw new ForbiddenException('Credentials are not correct');
    }

    return this.createTokens(existUser);
  }

  private createTokens({ id, login, role }) {
    const payload: AppJwtPayload = {
      userId: id,
      login,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.TOKEN_EXPIRE_TIME,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.TOKEN_REFRESH_EXPIRE_TIME,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

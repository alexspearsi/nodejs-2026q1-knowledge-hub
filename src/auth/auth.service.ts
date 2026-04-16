import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../generated/prisma/enums';
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
  private readonly JWT_SECRET_KEY;
  private readonly JWT_SECRET_REFRESH_KEY;
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
    this.JWT_SECRET_KEY = this.configService.getOrThrow('JWT_SECRET_KEY');
    this.JWT_SECRET_REFRESH_KEY = this.configService.getOrThrow(
      'JWT_SECRET_REFRESH_KEY',
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
      const samePassword = await bcrypt.compare(password, existUser.password);

      if (!samePassword) {
        throw new BadRequestException('Login already exists');
      }

      return { id: existUser.id, login: existUser.login };
    }

    const hashedPassword = await bcrypt.hash(password, this.CRYPT_SALT);

    const adminCount = await this.prismaService.user.count({
      where: { role: UserRole.admin },
    });

    const newUser = await this.prismaService.user.create({
      data: {
        login,
        password: hashedPassword,
        role: adminCount === 0 ? UserRole.admin : UserRole.viewer,
      },
    });

    return { id: newUser.id, login: newUser.login };
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
      secret: this.JWT_SECRET_KEY,
      expiresIn: this.TOKEN_EXPIRE_TIME,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.JWT_SECRET_REFRESH_KEY,
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

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.JWT_SECRET_REFRESH_KEY,
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.userId },
      });

      return this.createTokens(user);
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }
}

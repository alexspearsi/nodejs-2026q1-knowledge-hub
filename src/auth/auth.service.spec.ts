import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../common/errors/app.error';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { CustomLogger } from '../common/logger/logger.service';
import { RolesGuard } from './guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../generated/prisma/enums';

const CRYPT_SALT = 10;

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_value'),
  compare: vi.fn().mockResolvedValue(true),
}));

const userId = 'c1a7f6b2-5e3d-4a9c-9f2a-8d7b1c0e6f45';
const dto = { login: 'test_user', password: 'password123' };

const userDB = {
  id: userId,
  login: 'test_user',
  password: 'hashed_password',
  role: UserRole.viewer,
  refreshTokenHash: 'hashed_refresh_token',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const db = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
};

const jwtServiceMock = {
  sign: vi.fn().mockReturnValue('mock_token'),
  verify: vi
    .fn()
    .mockReturnValue({ userId, login: userDB.login, role: UserRole.viewer }),
};

const configServiceMock = {
  getOrThrow: vi.fn(
    (key: string) =>
      ({
        TOKEN_EXPIRE_TIME: '1h',
        TOKEN_REFRESH_EXPIRE_TIME: '7d',
        JWT_SECRET_KEY: 'secret',
        JWT_SECRET_REFRESH_KEY: 'refresh_secret',
        CRYPT_SALT: '10',
      })[key],
  ),
};

const loggerMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  const res = {} as any;

  beforeEach(async () => {
    vi.clearAllMocks();

    db.user.findUnique.mockResolvedValue(userDB);
    db.user.create.mockResolvedValue(userDB);
    db.user.update.mockResolvedValue(userDB);
    db.user.updateMany.mockResolvedValue({ count: 1 });
    db.user.count.mockResolvedValue(1);

    jwtServiceMock.sign.mockReturnValue('mock_token');
    jwtServiceMock.verify.mockReturnValue({
      userId,
      login: userDB.login,
      role: UserRole.viewer,
    });

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed_value' as never);

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: db },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: CustomLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should return existing user when login and password correct', async () => {
      const result = await service.signup(res, dto);

      expect(result).toEqual({ id: userDB.id, login: userDB.login });
    });

    it('should throw ValidationError when login exists but password is different', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.signup(res, dto)).rejects.toThrow(ValidationError);
    });

    it('should assign admin role to first registered user', async () => {
      db.user.findUnique.mockResolvedValue(null);
      db.user.count.mockResolvedValue(0);

      await service.signup(res, dto);

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: UserRole.admin }),
        }),
      );
    });

    it('should adding viewer role when admin already exists', async () => {
      db.user.findUnique.mockResolvedValue(null);
      db.user.count.mockResolvedValue(1);

      await service.signup(res, dto);

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: UserRole.viewer }),
        }),
      );
    });

    it('should hash password before saving new user', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await service.signup(res, dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, CRYPT_SALT);
    });
  });

  describe('login', () => {
    it('should throw ForbiddenError when user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(service.login(res, dto)).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when password is wrong', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login(res, dto)).rejects.toThrow(ForbiddenError);
    });

    it('should return accessToken and refreshToken on success', async () => {
      const result = await service.login(res, dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should sign access token with JWT_SECRET_KEY', async () => {
      await service.login(res, dto);

      expect(jwtServiceMock.sign).toHaveBeenCalledWith(
        expect.objectContaining({ userId, login: userDB.login }),
        expect.objectContaining({ secret: 'secret' }),
      );
    });

    it('should save hashed refresh token after login', async () => {
      await service.login(res, dto);

      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: expect.objectContaining({ refreshTokenHash: 'hashed_value' }),
        }),
      );
    });
  });

  describe('refres', () => {
    it('should throw UnauthorizedError when token is empty', async () => {
      await expect(service.refresh('')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError when token is invalid', async () => {
      jwtServiceMock.verify.mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(service.refresh('wrong_toeken')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw ForbiddenError when user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(service.refresh('valid_token')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw ForbiddenError when token does not match', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.refresh('valid_token')).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should return new token on success', async () => {
      const result = await service.refresh('valid_token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should rotate refresh token hash after successful refresh', async () => {
      await service.refresh('valid_token');

      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: expect.objectContaining({ refreshTokenHash: 'hashed_value' }),
        }),
      );
    });
  });

  describe('validate', () => {
    it('should return user when payload is valid', async () => {
      const result = await service.validate({
        userId,
        login: userDB.login,
        role: UserRole.viewer,
      });

      expect(result).toEqual(userDB);
    });

    it('should throw NotFoundError when user not found', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validate({
          userId: 'random_id',
          login: 'user_login',
          role: UserRole.viewer,
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('logout', () => {
    it('should clear refresh token hash', async () => {
      await service.logout(userId);

      expect(db.user.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId, refreshTokenHash: { not: null } },
          data: { refreshTokenHash: null },
        }),
      );
    });
  });

  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [RolesGuard, Reflector],
      }).compile();

      guard = module.get<RolesGuard>(RolesGuard);
      reflector = module.get<Reflector>(Reflector);
    });

    const makeContext = (userRole: UserRole) =>
      ({
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: userRole } }),
        }),
      }) as any;

    it('should allow access when no roles are required', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      expect(guard.canActivate(makeContext(UserRole.viewer))).toBe(true);
    });

    it('should allow access when user has required role', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        UserRole.admin,
      ]);

      expect(guard.canActivate(makeContext(UserRole.admin))).toBe(true);
    });

    it('should throw ForbiddenError when user lacks required role', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        UserRole.admin,
      ]);

      expect(() => guard.canActivate(makeContext(UserRole.viewer))).toThrow(
        ForbiddenError,
      );
    });
  });
});

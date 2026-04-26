import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { User } from './user.interface';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../common/errors/app.error';
import * as bcrypt from 'bcrypt';

const CRYPT_SALT = 10;

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true),
}));

const userId = 'c1a7f6b2-5e3d-4a9c-9f2a-8d7b1c0e6f45';

export const users: User[] = [
  {
    id: userId,
    login: 'admin_user',
    password: 'admin123',
    role: UserRole.ADMIN,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '7e2c9d41-3b6f-4f8a-8a12-5c9e7d2b1a90',
    login: 'editor_user',
    password: 'editor123',
    role: UserRole.EDITOR,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'a9d3b5f8-1c7e-4d2a-b6f3-9e0c2a7d4b11',
    login: 'viewer_user',
    password: 'viewer123',
    role: UserRole.VIEWER,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const user: User = users[0];

const dto: CreateUserDto = {
  login: user.login,
  password: user.password,
};

const now = new Date();
const userDB = users.map((user) => ({
  ...user,
  createdAt: now,
  updatedAt: now,
}));
const { password: _, ...userWithoutPassword } = userDB[0];

const db = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('User Service', () => {
  let service: UserService;

  beforeEach(async () => {
    vi.clearAllMocks();
    db.user.findMany.mockResolvedValue(userDB);
    db.user.findUnique.mockResolvedValue(userDB[0]);
    db.user.create.mockResolvedValue(userWithoutPassword);
    db.user.update.mockResolvedValue(userWithoutPassword);

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: ConfigService,
          useValue: { getOrThrow: vi.fn(() => CRYPT_SALT) },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of users with timestamps', async () => {
    const result = await service.findAll(new GetUsersQueryDto());

    const users = Array.isArray(result) ? result : result.data;

    users.forEach((user) => {
      expect(user).toMatchObject({
        id: expect.any(String),
        login: expect.any(String),
        role: expect.any(String),
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const result = await service.findById(userId);

      expect(result).toMatchObject({ id: userId, login: user.login });
      expect(result.createdAt).toBe(now.getTime());
    });

    it('should throw NotFoundError when user does not esits', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('id_that_doesnt_exist')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('create', () => {
    it('should throw ValidationError when login already exists', async () => {
      await expect(service.create(dto)).rejects.toThrow(ValidationError);
    });

    it('should hash password before saving', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await service.create(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, CRYPT_SALT);
    });

    it('should save hashed password, not plain text', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await service.create(dto);

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: 'hashed_password' }),
        }),
      );
    });

    it('should assign VIEWER role by default when role is not provided', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await service.create({ login: 'new_user', password: 'my_password' });

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: UserRole.VIEWER }),
        }),
      );
    });

    it('should assign provided role when specifed', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await service.create({
        login: 'new_user',
        password: 'my_password',
        role: UserRole.ADMIN,
      });

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: UserRole.ADMIN }),
        }),
      );
    });

    it('should return created user with timestamps', async () => {
      db.user.findUnique.mockResolvedValue(null);

      const result = await service.create(dto);

      expect(result).toMatchObject({
        id: expect.any(String),
        createdAt: now.getTime(),
        updatedAt: now.getTime(),
      });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      db.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { role: UserRole.EDITOR }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when old password is incorrect', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        service.update(userId, {
          oldPassword: 'wrong',
          newPassword: 'wrong_password',
        }),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});

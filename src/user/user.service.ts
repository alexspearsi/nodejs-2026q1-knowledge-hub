import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { SortOrder } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly CRYPT_SALT: number;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.CRYPT_SALT = Number(this.configService.getOrThrow('CRYPT_SALT'));
  }

  async findAll(query?: GetUsersQueryDto) {
    let users = (
      await this.prismaService.user.findMany({
        select: {
          id: true,
          login: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    ).map((user) => ({
      ...user,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    }));

    if (query.sortBy) {
      const order = query.order ?? SortOrder.DESC;
      users = [...users].sort((a, b) => {
        const first = a[query.sortBy];
        const second = b[query.sortBy];

        if (first < second) {
          return order === SortOrder.ASC ? -1 : 1;
        }

        if (first > second) {
          return order === SortOrder.ASC ? 1 : -1;
        }

        return 0;
      });
    }

    if (query.page !== undefined || query.limit !== undefined) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const total = users.length;
      const data = users.slice((page - 1) * limit, page * limit);

      return { total, page, limit, data };
    }

    return users;
  }

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { login: dto.login },
    });

    if (existing) {
      throw new BadRequestException('Login already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.CRYPT_SALT);

    const user = await this.prismaService.user.create({
      data: {
        login: dto.login,
        password: hashedPassword,
        role: dto.role ?? UserRole.VIEWER,
      },
      select: {
        id: true,
        login: true,
        role: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updateData: { password?: string; role?: typeof dto.role } = {};

    if (dto.role !== undefined) {
      updateData.role = dto.role;
    }

    if (dto.oldPassword !== undefined && dto.newPassword !== undefined) {
      const isValid = await bcrypt.compare(dto.oldPassword, existing.password);

      if (!isValid) {
        throw new ForbiddenException('Old password is incorrect');
      }

      updateData.password = await bcrypt.hash(dto.newPassword, this.CRYPT_SALT);
    }

    const user = await this.prismaService.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        login: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    };
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prismaService.$transaction(async (tx) => {
      await tx.article.updateMany({
        where: { authorId: id },
        data: { authorId: null },
      });
      await tx.comment.deleteMany({ where: { authorId: id } });
      await tx.user.delete({ where: { id } });
    });
  }
}

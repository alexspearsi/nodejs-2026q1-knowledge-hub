import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { SortOrder } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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
    const hashedPassword = await bcrypt.hash(dto.password, 10);

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

  async update(id: string, dto: UpdatePasswordDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.oldPassword, existing.password);

    if (!isValid) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    const user = await this.prismaService.user.update({
      where: { id },
      data: { password: hashedPassword },
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

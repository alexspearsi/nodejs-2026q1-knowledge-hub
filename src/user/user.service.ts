import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { randomUUID } from 'node:crypto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserStorageService } from '../database/user.storage.service';
import { ArticleStorageService } from '../database/article.storage.service';
import { CommentStorageService } from '../database/comment.storage.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userStorage: UserStorageService,
    private readonly articleStorage: ArticleStorageService,
    private readonly commentStorage: CommentStorageService,
  ) {}

  findAll() {
    const users = this.userStorage.findAll();

    return users.map(({ id, login, role, createdAt, updatedAt }) => ({
      id,
      login,
      role,
      createdAt,
      updatedAt,
    }));
  }

  findById(id: string) {
    const user = this.userStorage.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  create(dto: CreateUserDto) {
    const { login, password, role = UserRole.VIEWER } = dto;

    const id = randomUUID();
    const now = Date.now();

    const newUser = {
      id,
      login,
      password,
      role,
      createdAt: now,
      updatedAt: now,
    };

    const createdUser = this.userStorage.create(newUser);

    return {
      id: createdUser.id,
      login: createdUser.login,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }

  update(id: string, dto: UpdatePasswordDto) {
    const user = this.userStorage.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== dto.oldPassword) {
      throw new ForbiddenException('Old password is incorrect');
    }

    user.password = dto.newPassword;
    user.updatedAt = Date.now();

    return {
      id: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  remove(id: string) {
    const deleted = this.userStorage.delete(id);

    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    this.articleStorage
      .findAll()
      .filter((article) => article.authorId === id)
      .forEach((article) => {
        article.authorId = null;
        article.updatedAt = Date.now();
      });

    this.commentStorage
      .findAll()
      .filter((comment) => comment.authorId === id)
      .forEach((comment) => this.commentStorage.delete(comment.id));
  }
}

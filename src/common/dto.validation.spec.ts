import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { AuthRequestDto } from '../auth/dto/signup.dto';
import { CreateUserDto, UserRole } from '../user/dto/create-user.dto';
import {
  CreateArticleDto,
  ArticleStatus,
} from '../article/dto/create-article.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

const getErrors = async (DtoClass: any, plain: object) => {
  const instance = plainToInstance(DtoClass, plain) as object;
  const errors = await validate(instance);

  return errors.map((e) => e.property);
};

describe('AuthRequestDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await getErrors(AuthRequestDto, {
      login: 'alex',
      password: 'secret',
    });

    expect(errors).toHaveLength(0);
  });

  it('should fail when login is missing', async () => {
    const errors = await getErrors(AuthRequestDto, { password: 'secret' });

    expect(errors).toContain('login');
  });

  it('should fail when password is missing', async () => {
    const errors = await getErrors(AuthRequestDto, { login: 'alex' });

    expect(errors).toContain('password');
  });

  it('should fail when login is empty string', async () => {
    const errors = await getErrors(AuthRequestDto, {
      login: '',
      password: 'secret',
    });

    expect(errors).toContain('login');
  });
});

describe('CreateUserDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await getErrors(CreateUserDto, {
      login: 'alex',
      password: 'secret',
    });

    expect(errors).toHaveLength(0);
  });

  it('should pass with optional role provided', async () => {
    const errors = await getErrors(CreateUserDto, {
      login: 'alex',
      password: 'secret',
      role: UserRole.ADMIN,
    });

    expect(errors).toHaveLength(0);
  });

  it('should fail when login is missing', async () => {
    const errors = await getErrors(CreateUserDto, { password: 'secret' });

    expect(errors).toContain('login');
  });

  it('should fail when password is missing', async () => {
    const errors = await getErrors(CreateUserDto, { login: 'alex' });

    expect(errors).toContain('password');
  });

  it('should fail when role is invalid enum value', async () => {
    const errors = await getErrors(CreateUserDto, {
      login: 'alex',
      password: 'secret',
      role: 'superadmin',
    });

    expect(errors).toContain('role');
  });
});

describe('CreateArticleDto', () => {
  it('should pass with valid payload', async () => {
    const errors = await getErrors(CreateArticleDto, {
      title: 'NestJS Guide',
      content: 'Full guide...',
    });

    expect(errors).toHaveLength(0);
  });

  it('should pass with all optional fields', async () => {
    const errors = await getErrors(CreateArticleDto, {
      title: 'Guide',
      content: 'Content',
      status: ArticleStatus.PUBLISHED,
      tags: ['nestjs', 'typescript'],
    });

    expect(errors).toHaveLength(0);
  });

  it('should fail when title is missing', async () => {
    const errors = await getErrors(CreateArticleDto, { content: 'Content' });

    expect(errors).toContain('title');
  });

  it('should fail when content is missing', async () => {
    const errors = await getErrors(CreateArticleDto, { title: 'Guide' });

    expect(errors).toContain('content');
  });

  it('should fail when status is invalid enum value', async () => {
    const errors = await getErrors(CreateArticleDto, {
      title: 'Guide',
      content: 'Content',
      status: 'unknown',
    });

    expect(errors).toContain('status');
  });

  it('should fail when tags exceed max size of 10', async () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    const errors = await getErrors(CreateArticleDto, {
      title: 'Guide',
      content: 'Content',
      tags,
    });

    expect(errors).toContain('tags');
  });

  it('should fail when tags contain duplicates', async () => {
    const errors = await getErrors(CreateArticleDto, {
      title: 'Guide',
      content: 'Content',
      tags: ['nestjs', 'nestjs'],
    });

    expect(errors).toContain('tags');
  });
});

describe('UpdateUserDto', () => {
  it('should pass with empty payload (all fields optional)', async () => {
    const errors = await getErrors(UpdateUserDto, {});

    expect(errors).toHaveLength(0);
  });

  it('should pass with valid role', async () => {
    const errors = await getErrors(UpdateUserDto, { role: 'editor' });

    expect(errors).toHaveLength(0);
  });

  it('should fail when role is invalid enum value', async () => {
    const errors = await getErrors(UpdateUserDto, { role: 'superadmin' });

    expect(errors).toContain('role');
  });

  it('should fail when oldPassword is empty string', async () => {
    const errors = await getErrors(UpdateUserDto, { oldPassword: '' });

    expect(errors).toContain('oldPassword');
  });
});

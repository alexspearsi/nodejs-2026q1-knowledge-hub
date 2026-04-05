import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { UpdatePasswordDto } from '../../user/dto/update-password.dto';

export function ApiGetUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of users returned successfully',
      content: {
        'application/json': {
          example: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              login: 'alex123',
              role: 'viewer',
              createdAt: '2026-04-02T12:00:00Z',
            },
          ],
        },
      },
    }),
  );
}

export function ApiGetUserById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiParam({ name: 'id', description: 'User UUID v4' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User found',
      content: {
        'application/json': {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            login: 'alex123',
            role: 'viewer',
            createdAt: '2026-04-02T12:00:00Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
  );
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new user' }),
    ApiBody({
      type: CreateUserDto,
      examples: {
        example1: {
          summary: 'Create user',
          value: {
            login: 'alex123',
            password: 'StrongPassword123',
            role: 'viewer',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User created successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
    }),
  );
}

export function ApiUpdateUserPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user password' }),
    ApiParam({ name: 'id', description: 'User UUID v4' }),
    ApiBody({
      type: UpdatePasswordDto,
      examples: {
        example1: {
          summary: 'Update password',
          value: {
            oldPassword: 'StrongPassword123',
            newPassword: 'NewStrongPassword123',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Password updated successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid data or UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
  );
}

export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete user by id' }),
    ApiParam({ name: 'id', description: 'User UUID v4' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'User deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
  );
}

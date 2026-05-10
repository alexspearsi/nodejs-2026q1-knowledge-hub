import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiSignup() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user account' }),
    ApiBody({
      schema: {
        example: { login: 'alex123', password: 'StrongPassword123' },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User registered successfully, returns access token',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error or login already taken',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Rate limit exceeded',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login with existing credentials' }),
    ApiBody({
      schema: {
        example: { login: 'alex123', password: 'StrongPassword123' },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login successful, returns access token',
      content: {
        'application/json': {
          example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Rate limit exceeded',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Logout current authenticated user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Logged out successfully',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing or invalid Bearer token',
    }),
  );
}

export function ApiRefresh() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token using refresh token' }),
    ApiBody({
      schema: {
        example: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns new access token',
      content: {
        'application/json': {
          example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid or expired refresh token',
    }),
  );
}

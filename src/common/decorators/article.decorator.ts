import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateArticleDto } from '../../article/dto/create-article.dto';
import { UpdateArticleDto } from '../../article/dto/update-article.dto';

export function ApiGetArticles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get list of articles' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of articles returned successfully',
      content: {
        'application/json': {
          example: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'NestJS Guide',
              content: 'Full guide...',
              status: 'published',
              createdAt: '2026-04-02T12:00:00Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing or invalid Bearer token',
    }),
  );
}

export function ApiGetArticleById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get article by id' }),
    ApiParam({ name: 'id', description: 'Article UUID v4' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article found',
      content: {
        'application/json': {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'NestJS Guide',
            content: 'Full guide...',
            status: 'published',
            createdAt: '2026-04-02T12:00:00Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID format',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
  );
}

export function ApiCreateArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new article' }),
    ApiBody({
      type: CreateArticleDto,
      examples: {
        example1: {
          summary: 'Create published article',
          value: {
            title: 'NestJs Guide',
            content: 'Full guide...',
            status: 'published',
            categoryId: '550e8400-e29b-41d4-a716-446655440001',
            tags: ['nestjs', 'backend'],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Article created successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
    }),
  );
}

export function ApiUpdateArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Update article by id' }),
    ApiParam({ name: 'id', description: 'Article UUID v4' }),
    ApiBody({
      type: UpdateArticleDto,
      examples: {
        example1: {
          summary: 'Update article title',
          value: {
            title: 'Updated title',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article updated successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid data or UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
  );
}

export function ApiDeleteArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete article by id' }),
    ApiParam({ name: 'id', description: 'Article UUID v4' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Article deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing or invalid Bearer token',
    }),
  );
}

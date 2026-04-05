import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCategoryDto } from '../../category/dto/create-category.dto';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';

export function ApiGetCategories() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all categories' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of categories returned successfully',
      content: {
        'application/json': {
          example: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Backend',
              description: 'Backend related topics',
              createdAt: '2026-04-02T12:00:00Z',
              updatedAt: '2026-04-02T12:00:00Z',
            },
          ],
        },
      },
    }),
  );
}

export function ApiGetCategoryById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get category by id' }),
    ApiParam({ name: 'id', description: 'Category UUID v4' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Category found',
      content: {
        'application/json': {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Backend',
            description: 'Backend related topics',
            createdAt: '2026-04-02T12:00:00Z',
            updatedAt: '2026-04-02T12:00:00Z',
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
      description: 'Category not found',
    }),
  );
}

export function ApiCreateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new category' }),
    ApiBody({
      type: CreateCategoryDto,
      examples: {
        example1: {
          summary: 'Create category',
          value: {
            name: 'Frontend',
            description: 'Frontend related topics',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Category created successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
    }),
  );
}

export function ApiUpdateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Update category by id' }),
    ApiParam({ name: 'id', description: 'Category UUID v4' }),
    ApiBody({
      type: UpdateCategoryDto,
      examples: {
        example1: {
          summary: 'Update category name',
          value: {
            name: 'Updated category',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Category updated successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid data or UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Category not found',
    }),
  );
}

export function ApiDeleteCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete category by id' }),
    ApiParam({ name: 'id', description: 'Category UUID v4' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Category deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Category not found',
    }),
  );
}

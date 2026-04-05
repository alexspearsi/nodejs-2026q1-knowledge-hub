import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCommentDto } from '../../comment/dto/create-comment.dto';

export function ApiGetComments() {
  return applyDecorators(
    ApiOperation({ summary: 'Get comments for article' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of comments returned successfully',
      content: {
        'application/json': {
          example: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              content: 'Nice article!',
              articleId: '550e8400-e29b-41d4-a716-446655440001',
              createdAt: '2026-04-02T12:00:00Z',
            },
          ],
        },
      },
    }),
  );
}

export function ApiGetCommentById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get comment by id' }),
    ApiParam({ name: 'id', description: 'Comment UUID v4' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Comment found',
      content: {
        'application/json': {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            content: 'Nice article!',
            articleId: '550e8400-e29b-41d4-a716-446655440001',
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
      description: 'Comment not found',
    }),
  );
}

export function ApiCreateComment() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new comment' }),
    ApiBody({
      type: CreateCommentDto,
      examples: {
        example1: {
          summary: 'Create comment',
          value: {
            content: 'Great article!',
            articleId: '550e8400-e29b-41d4-a716-446655440000',
            authorId: '550e8400-e29b-41d4-a716-446655440001',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Comment created successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
    }),
  );
}

export function ApiDeleteComment() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete comment by id' }),
    ApiParam({ name: 'id', description: 'Comment UUID v4' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Comment deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Comment not found',
    }),
  );
}

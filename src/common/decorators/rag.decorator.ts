import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { IndexRagDto } from '../../rag/dto/index-rag.dto';
import { SearchRagDto } from '../../rag/dto/search-rag.dto';
import { ChatRagDto } from '../../rag/dto/chat-rag.dto';

export function ApiRagIndex() {
  return applyDecorators(
    ApiOperation({ summary: 'Index Knowledge Hub articles into vector DB' }),
    ApiBody({
      type: IndexRagDto,
      examples: {
        all: {
          summary: 'Index all published articles',
          value: { onlyPublished: true },
        },
        selective: {
          summary: 'Index specific articles',
          value: { articleIds: ['uuid-1', 'uuid-2'] },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Articles indexed successfully',
    }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Vector DB or Gemini unavailable',
    }),
  );
}

export function ApiRagSearch() {
  return applyDecorators(
    ApiOperation({ summary: 'Semantic search in Knowledge Hub' }),
    ApiBody({
      type: SearchRagDto,
      examples: {
        simple: {
          summary: 'Simple search',
          value: { query: 'how to authenticate users', limit: 5 },
        },
        filtered: {
          summary: 'Search with filters',
          value: {
            query: 'database optimization',
            limit: 3,
            articleStatus: 'published',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Search results returned',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Query is missing',
    }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Vector DB or Gemini unavailable',
    }),
  );
}

export function ApiRagChat() {
  return applyDecorators(
    ApiOperation({ summary: 'Chat with Knowledge Hub using RAG' }),
    ApiBody({
      type: ChatRagDto,
      examples: {
        newConversation: {
          summary: 'Start new conversation',
          value: {
            question: 'What articles do you have about authentication?',
          },
        },
        continueConversation: {
          summary: 'Continue existing conversation',
          value: {
            question: 'Can you elaborate on JWT?',
            conversationId: 'uuid',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Answer generated with sources',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Question is missing',
    }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Vector DB or Gemini unavailable',
    }),
  );
}

export function ApiRagDeleteArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove article vectors from index' }),
    ApiParam({ name: 'articleId', description: 'Article UUID v4' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Article removed from index',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found in index',
    }),
  );
}

export function ApiRagHistory() {
  return applyDecorators(
    ApiOperation({ summary: 'Get conversation history' }),
    ApiParam({ name: 'conversationId', description: 'Conversation UUID v4' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Conversation history returned',
    }),
  );
}

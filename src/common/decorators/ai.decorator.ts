import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GenerateDto } from '../../ai/dto/generate.dto';
import { SummarizeArticleDto } from '../../ai/dto/summarize-article.dto';
import { TranslateArticleDto } from '../../ai/dto/translate-article.dto';
import { AnalyzeArticleDto } from '../../ai/dto/analyze-article.dto';

export function ApiAiTest() {
  return applyDecorators(
    ApiOperation({ summary: 'Test Gemini AI connection' }),
    ApiResponse({ status: HttpStatus.OK, description: 'AI response returned' }),
  );
}

export function ApiAiUsage() {
  return applyDecorators(
    ApiOperation({ summary: 'Get AI usage statistics' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Current AI usage stats',
    }),
  );
}

export function ApiAiGenerate() {
  return applyDecorators(
    ApiOperation({ summary: 'Generate content with a custom prompt' }),
    ApiBody({
      type: GenerateDto,
      examples: {
        example1: {
          summary: 'Simple generation',
          value: { prompt: 'Explain NestJS in 3 sentences' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Generated text content',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'AI rate limit exceeded',
    }),
  );
}

export function ApiAiSummarize() {
  return applyDecorators(
    ApiOperation({ summary: 'Summarize an article using AI' }),
    ApiParam({ name: 'articleId', description: 'Article UUID v4' }),
    ApiBody({
      type: SummarizeArticleDto,
      examples: {
        short: {
          summary: 'Short summary',
          value: { maxLength: 'short' },
        },
        medium: {
          summary: 'Medium summary (default)',
          value: { maxLength: 'medium' },
        },
        detailed: {
          summary: 'Detailed summary',
          value: { maxLength: 'detailed' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article summary generated',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'AI rate limit exceeded',
    }),
  );
}

export function ApiAiTranslate() {
  return applyDecorators(
    ApiOperation({ summary: 'Translate an article using AI' }),
    ApiParam({ name: 'articleId', description: 'Article UUID v4' }),
    ApiBody({
      type: TranslateArticleDto,
      examples: {
        toUkrainian: {
          summary: 'Translate to Ukrainian',
          value: { targetLanguage: 'Ukrainian', sourceLanguage: 'English' },
        },
        toSpanish: {
          summary: 'Translate to Spanish (auto-detect source)',
          value: { targetLanguage: 'Spanish' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article translation generated',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'AI rate limit exceeded',
    }),
  );
}

export function ApiAiAnalyze() {
  return applyDecorators(
    ApiOperation({ summary: 'Analyze an article using AI' }),
    ApiParam({ name: 'articleId', description: 'Article UUID v4' }),
    ApiBody({
      type: AnalyzeArticleDto,
      examples: {
        review: {
          summary: 'General review',
          value: { task: 'review' },
        },
        bugs: {
          summary: 'Find bugs',
          value: { task: 'bugs' },
        },
        optimize: {
          summary: 'Suggest optimizations',
          value: { task: 'optimize' },
        },
        explain: {
          summary: 'Explain the content',
          value: { task: 'explain' },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article analysis generated',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'AI rate limit exceeded',
    }),
  );
}

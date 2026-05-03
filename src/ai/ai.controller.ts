import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { AIService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly AIService: AIService) {}

  @Get('test')
  async test() {
    const result = await this.AIService.generateContent(
      'who am I? in 2 sentences',
    );
    return { result };
  }

  @Post('articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: SummarizeArticleDto,
  ) {
    return this.AIService.summarize(articleId, body);
  }

  @Post('articles/:articleId/translate')
  @HttpCode(HttpStatus.OK)
  async translate(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: TranslateArticleDto,
  ) {
    return this.AIService.translate(articleId, body);
  }

  @Post('articles/:articleId/analyze')
  @HttpCode(HttpStatus.OK)
  async analyze(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: AnalyzeArticleDto,
  ) {
    return this.AIService.analyze(articleId, body);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AIService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { GenerateDto } from './dto/generate.dto';
import { AIRateLimitGuard } from './guards/ai-rate-limit.guard';
import { AIUsageService } from './ai-usage.service';

@Controller('ai')
@UseGuards(AIRateLimitGuard)
export class AiController {
  constructor(
    private readonly AIService: AIService,
    private readonly usageService: AIUsageService,
  ) {}

  @Get('test')
  async test() {
    return await this.AIService.generateContent({
      prompt: 'who am I? in 2 sentences',
    });
  }

  @Get('usage')
  getUsage() {
    return this.usageService.getStats();
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() body: GenerateDto) {
    return this.AIService.generateContent(body);
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

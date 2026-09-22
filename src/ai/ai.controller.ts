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
import { ApiTags } from '@nestjs/swagger';
import { AIService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { GenerateDto } from './dto/generate.dto';
import { AIRateLimitGuard } from './guards/ai-rate-limit.guard';
import { AIUsageService } from './ai-usage.service';
import {
  ApiAiAnalyze,
  ApiAiGenerate,
  ApiAiSummarize,
  ApiAiTest,
  ApiAiTranslate,
  ApiAiUsage,
} from '../common/decorators/ai.decorator';

@ApiTags('AI')
@Controller('ai')
@UseGuards(AIRateLimitGuard)
export class AiController {
  constructor(
    private readonly AIService: AIService,
    private readonly usageService: AIUsageService,
  ) {}

  @ApiAiTest()
  @Get('test')
  async test() {
    return await this.AIService.generateContent({
      prompt: 'who am I? in 2 sentences',
    });
  }

  @ApiAiUsage()
  @Get('usage')
  getUsage() {
    return this.usageService.getStats();
  }

  @ApiAiGenerate()
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() body: GenerateDto) {
    return this.AIService.generateContent(body);
  }

  @ApiAiSummarize()
  @Post('articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: SummarizeArticleDto,
  ) {
    return this.AIService.summarize(articleId, body);
  }

  @ApiAiTranslate()
  @Post('articles/:articleId/translate')
  @HttpCode(HttpStatus.OK)
  async translate(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: TranslateArticleDto,
  ) {
    return this.AIService.translate(articleId, body);
  }

  @ApiAiAnalyze()
  @Post('articles/:articleId/analyze')
  @HttpCode(HttpStatus.OK)
  async analyze(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: AnalyzeArticleDto,
  ) {
    return this.AIService.analyze(articleId, body);
  }
}

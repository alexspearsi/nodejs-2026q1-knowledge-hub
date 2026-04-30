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

import { AiService } from './gemini.service';
import { SummarizeArticleDto } from './dto/summarize-article.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('test')
  async test() {
    const result = await this.aiService.generateContent('who am I?');
    return { result };
  }

  @Post('articles/:articleId/summarize')
  @HttpCode(HttpStatus.OK)
  async summarize(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
    @Body() body: SummarizeArticleDto,
  ) {
    return this.aiService.summarize(articleId, body);
  }
}

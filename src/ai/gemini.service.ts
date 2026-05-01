import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from '../common/errors/app.error';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { SummarizeArticleResponseDto } from './dto/summarize-article-response.dto';
import { buildSummarizePrompt } from './prompts/summarize.prompt';
import { AICacheService } from './ai-cache.service';
import { AiUsageService } from './ai-usage.service';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly cacheService: AICacheService,
    private readonly usageService: AiUsageService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.baseUrl = this.configService.get<string>('GEMINI_API_BASE_URL');
    this.model = this.configService.get<string>('GEMINI_MODEL');
  }

  private getUrl(): string {
    return `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  async generateContent(prompt: string): Promise<string> {
    const url = this.getUrl();

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, {
          contents: [{ parts: [{ text: prompt }] }],
        }),
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      this.handleError(error, url);
      throw error;
    }
  }

  async summarize(articleId: string, dto: SummarizeArticleDto) {
    const article = await this.prismaService.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    const cacheKey = `summarize:${articleId}:${dto.maxLength ?? 'medium'}:${article.updatedAt.getTime()}`;
    const cached = this.cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    this.usageService.track('summarize');

    const summary = await this.callGemini(
      buildSummarizePrompt(article.content, dto.maxLength ?? 'medium'),
    );

    const response: SummarizeArticleResponseDto = {
      articleId,
      summary,
      originalLength: article.content.length,
      summaryLength: summary.length,
    };

    this.cacheService.set(cacheKey, response);

    return response;
  }

  async callGemini(prompt: string) {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { timeout: 30000 }),
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      const status: number | undefined = error?.response?.status;

      if (status === 401 || status === 403) {
        throw new InternalServerErrorException(
          'AI service authentication failed',
        );
      }

      if (status === 429) {
        throw new ServiceUnavailableException('AI service rate limit exceeded');
      }

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new ServiceUnavailableException(
          'AI service is temporarily unavailable',
        );
      }
    }
  }

  private handleError(error: any, url: string) {
    console.error('Gemini error status:', error?.response?.status);
    console.error('Gemini error data:', JSON.stringify(error?.response?.data));

    console.error('URL used:', url);
  }
}

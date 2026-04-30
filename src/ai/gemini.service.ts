import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundError } from '../common/errors/app.error';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { SummarizeArticleResponseDto } from './dto/summarize-article-response.dto';
import { buildSummarizePrompt } from './prompts/summarize.prompt';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
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
    const url = this.getUrl();

    try {
      const article = await this.prismaService.article.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new NotFoundError('Article not found');
      }

      const geminiResponse = await firstValueFrom(
        this.httpService.post(url, {
          contents: [
            {
              parts: [
                {
                  text: buildSummarizePrompt(
                    article.content,
                    dto.maxLength ?? 'medium',
                  ),
                },
              ],
            },
          ],
        }),
      );

      const summary = geminiResponse.data.candidates[0].content.parts[0].text;

      const response: SummarizeArticleResponseDto = {
        articleId,
        summary,
        originalLength: article.content.length,
        summaryLength: summary.length,
      };

      return response;
    } catch (error: any) {
      this.handleError(error, url);
      throw error;
    }
  }

  private handleError(error: any, url: string) {
    console.error('Gemini error status:', error?.response?.status);
    console.error('Gemini error data:', JSON.stringify(error?.response?.data));

    console.error('URL used:', url);
  }
}

import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EmbeddingService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly embeddingModel: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.baseUrl = this.configService.get<string>('GEMINI_API_BASE_URL');
    this.embeddingModel = this.configService.get<string>(
      'GEMINI_EMBEDDING_MODEL',
      'text-embedding-004',
    );
  }

  async embed(text: string): Promise<number[]> {
    const url = `${this.baseUrl}/v1beta/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;

    const body = {
      model: `models/${this.embeddingModel}`,
      content: { parts: [{ text }] },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { timeout: 30000 }),
      );

      return response.data.embedding.values;
    } catch {
      throw new ServiceUnavailableException('Embedding service is unavailable');
    }
  }
}

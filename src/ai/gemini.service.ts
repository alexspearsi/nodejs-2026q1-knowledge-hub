import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.baseUrl = this.configService.get<string>('GEMINI_API_BASE_URL');
    this.model = this.configService.get<string>('GEMINI_MODEL');
  }

  async generateContent(prompt: string): Promise<string> {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, {
          contents: [{ parts: [{ text: prompt }] }],
        }),
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      console.error('Gemini error status:', error?.response?.status);
      console.error(
        'Gemini error data:',
        JSON.stringify(error?.response?.data),
      );
      console.error('Gemini error message:', error?.message);
      console.error(
        'URL used (no key):',
        `${this.baseUrl}/v1beta/models/${this.model}:generateContent`,
      );
      throw error;
    }
  }
}

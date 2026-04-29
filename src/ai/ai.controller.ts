import { Controller, Get } from '@nestjs/common';
import { AiService } from './gemini.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('test')
  async test() {
    const result = await this.aiService.generateContent(
      'Say hello in one sentence',
    );
    return { result };
  }
}

import { Module } from '@nestjs/common';
import { AIService } from './gemini.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { AICacheService } from './ai-cache.service';
import { AIUsageService } from './ai-usage.service';
import { AIRateLimitGuard } from './guards/ai-rate-limit.guard';

@Module({
  imports: [HttpModule, ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [AIService, AICacheService, AIUsageService, AIRateLimitGuard],
})
export class AiModule {}

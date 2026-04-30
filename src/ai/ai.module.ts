import { Module } from '@nestjs/common';
import { AiService } from './gemini.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, ConfigModule, PrismaModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

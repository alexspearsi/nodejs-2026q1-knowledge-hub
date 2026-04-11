import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [PrismaModule, DatabaseModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}

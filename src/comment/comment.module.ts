import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [PrismaModule, DatabaseModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}

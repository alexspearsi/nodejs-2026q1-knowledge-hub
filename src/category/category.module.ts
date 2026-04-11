import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [PrismaModule, DatabaseModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}

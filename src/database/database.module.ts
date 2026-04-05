import { Module } from '@nestjs/common';
import { ArticleStorageService } from './article.storage.service';
import { CategoryStorageService } from './category.storage.service';
import { CommentStorageService } from './comment.storage.service';
import { UserStorageService } from './user.storage.service';

@Module({
  providers: [
    UserStorageService,
    ArticleStorageService,
    CategoryStorageService,
    CommentStorageService,
  ],
  exports: [
    UserStorageService,
    ArticleStorageService,
    CategoryStorageService,
    CommentStorageService,
  ],
})
export class DatabaseModule {}

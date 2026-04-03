import { Article } from '../article/article.interface';
import { BaseStorageService } from './base.storage.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class ArticleStorageService
  extends BaseStorageService<Article>
  implements OnModuleInit
{
  onModuleInit() {
    const statuses: Article['status'][] = ['draft', 'published', 'archived'];
    const tags = ['javascript', 'typescript', 'nodejs', 'nestjs', 'api'];

    for (let i = 1; i <= 100; i++) {
      const now = Date.now();
      this.create({
        id: randomUUID(),
        title: `Article #${i}: Topic ${i}`,
        content: `Content of article number ${i}.`,
        status: statuses[i % statuses.length],
        authorId: null,
        categoryId: null,
        tags: tags.slice(0, (i % tags.length) + 1),
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}

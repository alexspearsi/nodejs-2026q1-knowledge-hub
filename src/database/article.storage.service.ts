import { Article } from '../article/article.interface';
import { BaseStorageService } from './base.storage.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleStorageService extends BaseStorageService<Article> {}

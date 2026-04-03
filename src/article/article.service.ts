import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStorageService } from '../database/article.storage.service';
import { ArticleStatus, CreateArticleDto } from './dto/create-article.dto';
import { randomUUID } from 'crypto';
import { Article } from './article.interface';
import { UpdateArticleDto } from './dto/update-article.dto';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { CommentStorageService } from '../database/comment.storage.service';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleStorage: ArticleStorageService,
    private readonly commentStorage: CommentStorageService,
  ) {}

  findAll(query: GetArticlesQueryDto) {
    let articles = this.articleStorage.findAll();

    if (query.status) {
      articles = articles.filter((a) => a.status === query.status);
    }

    if (query.authorId) {
      articles = articles.filter((a) => a.authorId === query.authorId);
    }

    if (query.categoryId) {
      articles = articles.filter((a) => a.categoryId === query.categoryId);
    }

    if (query.tag) {
      articles = articles.filter((a) => a.tags.includes(query.tag));
    }

    if (query.status || query.authorId || query.categoryId || query.tag) {
      return articles;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const start = (page - 1) * limit;
    const end = start + limit;

    return articles.slice(start, end);
  }

  findById(id: string) {
    const article = this.articleStorage.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  create(dto: CreateArticleDto) {
    const id = randomUUID();
    const now = Date.now();

    const newArticle: Article = {
      id,
      title: dto.title,
      content: dto.content,
      status: dto.status ?? ArticleStatus.DRAFT,
      authorId: dto.authorId ?? null,
      categoryId: dto.categoryId ?? null,
      tags: dto.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    this.articleStorage.create(newArticle);

    return newArticle;
  }

  update(id: string, dto: UpdateArticleDto) {
    const article = this.findById(id);

    Object.assign(article, dto, { updatedAt: Date.now() });

    return article;
  }

  remove(id: string) {
    const deleted = this.articleStorage.delete(id);

    if (!deleted) {
      throw new NotFoundException('Article not found');
    }

    this.commentStorage
      .findAll()
      .filter((comment) => comment.articleId === id)
      .forEach((comment) => this.commentStorage.delete(comment.id));
  }
}

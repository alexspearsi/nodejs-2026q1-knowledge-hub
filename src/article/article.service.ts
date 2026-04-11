import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { SortOrder } from '../common/types';
import { CreateArticleDto, ArticleStatus } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Prisma } from '../generated/prisma/client';

type ArticleWithTags = Prisma.ArticleGetPayload<{ include: { tags: true } }>;

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query?: GetArticlesQueryDto) {
    const articles = await this.prismaService.article.findMany({
      where: {
        status: query?.status,
        authorId: query?.authorId,
        categoryId: query?.categoryId,
        tags: query?.tag
          ? {
              some: {
                name: query.tag,
              },
            }
          : undefined,
      },
      include: {
        tags: true,
      },
    });

    let result = articles.map((a) => this.mapArticle(a));

    if (query?.sortBy) {
      const order = query.order ?? SortOrder.DESC;

      result = [...result].sort((a, b) => {
        const first = a[query.sortBy];
        const second = b[query.sortBy];

        if (first < second) return order === SortOrder.ASC ? -1 : 1;
        if (first > second) return order === SortOrder.ASC ? 1 : -1;
        return 0;
      });
    }

    if (query?.page !== undefined || query?.limit !== undefined) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;

      const total = result.length;
      const data = result.slice((page - 1) * limit, page * limit);

      return { total, page, limit, data };
    }

    return result;
  }

  async findById(id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { id },
      include: {
        tags: true,
        category: true,
        author: true,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.mapArticle(article);
  }

  async create(dto: CreateArticleDto) {
    const article = await this.prismaService.article.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status ?? ArticleStatus.DRAFT,

        author: dto.authorId ? { connect: { id: dto.authorId } } : undefined,

        category: dto.categoryId
          ? { connect: { id: dto.categoryId } }
          : undefined,

        tags: dto.tags?.length
          ? {
              connectOrCreate: dto.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
        category: true,
        author: true,
      },
    });

    return this.mapArticle(article);
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.findById(id);

    const article = await this.prismaService.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,

        category: dto.categoryId
          ? { connect: { id: dto.categoryId } }
          : { disconnect: true },

        tags: dto.tags?.length
          ? {
              set: [],
              connectOrCreate: dto.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
      },
      include: {
        tags: true,
        category: true,
        author: true,
      },
    });

    return this.mapArticle(article);
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prismaService.$transaction([
      this.prismaService.comment.deleteMany({
        where: { articleId: id },
      }),

      this.prismaService.article.delete({
        where: { id },
      }),
    ]);
  }

  private mapArticle(article: ArticleWithTags) {
    return {
      ...article,

      tags: article.tags?.map((tag) => tag.name) ?? [],

      createdAt: article.createdAt.getTime(),

      updatedAt: article.updatedAt.getTime(),
    };
  }
}

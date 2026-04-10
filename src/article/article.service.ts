import { Injectable, NotFoundException } from '@nestjs/common';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { SortOrder } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { ArticleStatus, CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query?: GetArticlesQueryDto) {
    let articles = await this.prismaService.article.findMany({
      include: { tags: true },
    });

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
      articles = articles.filter((a) =>
        a.tags.some((tag) => tag.name === query.tag),
      );
    }

    if (query.sortBy) {
      const order = query.order ?? SortOrder.DESC;
      articles = [...articles].sort((a, b) => {
        const first = a[query.sortBy];
        const second = b[query.sortBy];

        if (first < second) {
          return order === SortOrder.ASC ? -1 : 1;
        }

        if (first > second) {
          return order === SortOrder.ASC ? 1 : -1;
        }

        return 0;
      });
    }

    if (query.page !== undefined || query.limit !== undefined) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const total = articles.length;
      const data = articles.slice((page - 1) * limit, page * limit);

      return { total, page, limit, data };
    }

    return articles;
  }

  async findById(id: string) {
    const article = await this.prismaService.article.findUnique({
      where: {
        id: id,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
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

        tags: dto.tags
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
        author: true,
        category: true,
      },
    });

    return article;
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.findById(id);

    const article = await this.prismaService.article.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,
      },
    });

    return article;
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
}

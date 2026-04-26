import { PrismaService } from '../prisma/prisma.service';
import { ArticleService } from './article.service';
import { ArticleStatus, CreateArticleDto } from './dto/create-article.dto';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { ForbiddenError, NotFoundError } from '../common/errors/app.error';
import { UserRole } from '../generated/prisma/enums';
import { SortOrder } from '../common/types';

const articleId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const userId = 'c1a7f6b2-5e3d-4a9c-9f2a-8d7b1c0e6f45';
const otherId = '7e2c9d41-3b6f-4f8a-8a12-5c9e7d2b1a90';

const now = new Date();

const articleDB = {
  id: articleId,
  title: 'Test Article',
  content: 'Test content',
  status: ArticleStatus.DRAFT,
  authorId: userId,
  categoryId: null,
  tags: [
    { id: 'first_tag', name: 'nestjs' },
    { id: 'second_tag', name: 'typescript' },
  ],
  category: null,
  author: null,
  createdAt: now,
  updatedAt: now,
};

const db = {
  article: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('Article Service', () => {
  let service: ArticleService;

  beforeEach(async () => {
    vi.clearAllMocks();
    db.article.findMany.mockResolvedValue([articleDB]);
    db.article.findUnique.mockResolvedValue(articleDB);
    db.article.create.mockResolvedValue(articleDB);
    db.article.update.mockResolvedValue(articleDB);

    const module = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return articles with tags and timestamps', async () => {
      const result = await service.findAll(new GetArticlesQueryDto());
      const articles = Array.isArray(result) ? result : result.data;

      articles.forEach((article) => {
        expect(article.tags).toEqual(['nestjs', 'typescript']);
        expect(article.createdAt).toBe(now.getTime());
        expect(article.updatedAt).toBe(now.getTime());
      });
    });

    it('should pass status filter for prisma', async () => {
      const query = Object.assign(new GetArticlesQueryDto(), {
        status: ArticleStatus.PUBLISHED,
      });

      await service.findAll(query);

      expect(db.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ArticleStatus.PUBLISHED }),
        }),
      );
    });

    it('should pass tag filter to prisma', async () => {
      const query = Object.assign(new GetArticlesQueryDto(), { tag: 'nestjs' });

      await service.findAll(query);

      expect(db.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { some: { name: 'nestjs' } },
          }),
        }),
      );
    });

    it('should pass authorId filter to prisma', async () => {
      const query = Object.assign(new GetArticlesQueryDto(), {
        authorId: userId,
      });

      await service.findAll(query);

      expect(db.article.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ authorId: userId }),
        }),
      );
    });

    it('should sort articles by title ASC when sortBy is provided', async () => {
      const second = { ...articleDB, id: 'other-id', title: 'Zebra Article' };
      db.article.findMany.mockResolvedValue([second, articleDB]);

      const query = Object.assign(new GetArticlesQueryDto(), {
        sortBy: 'title',
        order: SortOrder.ASC,
      });

      const result = await service.findAll(query);
      const list = Array.isArray(result) ? result : result.data;

      expect(list[0].title).toBe('Test Article');
    });

    it('should return paginated result when page and limit are provided', async () => {
      const second = { ...articleDB, id: 'other-id', title: 'Second Article' };
      db.article.findMany.mockResolvedValue([articleDB, second]);

      const query = Object.assign(new GetArticlesQueryDto(), {
        page: 1,
        limit: 1,
      });

      const result = await service.findAll(query);

      expect(result).toMatchObject({ total: 2, page: 1, limit: 1 });
      expect((result as any).data).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return article with tags', async () => {
      const result = await service.findById(articleId);

      expect(result.tags).toEqual(['nestjs', 'typescript']);
      expect(result.createdAt).toBe(now.getTime());
    });

    it('should throw NotFoundError when article does not exist', async () => {
      db.article.findUnique.mockResolvedValue(null);

      await expect(service.findById('dont_exist')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('create', () => {
    it('should set DRAFT status by default when status not provided', async () => {
      const dto: CreateArticleDto = {
        title: 'New Article',
        content: 'Content',
      };

      await service.create(dto, userId);

      expect(db.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: ArticleStatus.DRAFT }),
        }),
      );
    });

    it('should set PUBLISHED status when provided', async () => {
      const dto: CreateArticleDto = {
        title: 'New Article',
        content: 'Content',
        status: ArticleStatus.PUBLISHED,
      };

      await service.create(dto, userId);

      expect(db.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: ArticleStatus.PUBLISHED }),
        }),
      );
    });

    it('should use currentUserId as authorId when not provided in dto', async () => {
      const dto: CreateArticleDto = {
        title: 'New Article',
        content: 'Content',
      };

      await service.create(dto, userId);

      expect(db.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            author: { connect: { id: userId } },
          }),
        }),
      );
    });

    it('should use connectOrCreate for tags', async () => {
      const dto: CreateArticleDto = {
        title: 'New Article',
        content: 'Content',
        tags: ['nestjs', 'typescript'],
      };

      await service.create(dto, userId);

      expect(db.article.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: {
              connectOrCreate: [
                { where: { name: 'nestjs' }, create: { name: 'nestjs' } },
                {
                  where: { name: 'typescript' },
                  create: { name: 'typescript' },
                },
              ],
            },
          }),
        }),
      );
    });

    it('should return article with tags', async () => {
      const dto: CreateArticleDto = {
        title: 'New Article',
        content: 'Content',
      };
      const result = await service.create(dto, userId);

      expect(result.tags).toEqual(['nestjs', 'typescript']);
    });

    describe('update', () => {
      it('should throw ForbiddenError when not admin updates another user article', async () => {
        await expect(
          service.update(
            articleId,
            { title: 'Updated' },
            otherId,
            UserRole.editor,
          ),
        ).rejects.toThrow(ForbiddenError);
      });

      it('should allow admin to update any article', async () => {
        await expect(
          service.update(
            articleId,
            { title: 'Updated' },
            otherId,
            UserRole.admin,
          ),
        ).resolves.not.toThrow();
      });

      it('should allow author to update own article', async () => {
        await expect(
          service.update(
            articleId,
            { title: 'Updated' },
            userId,
            UserRole.editor,
          ),
        ).resolves.not.toThrow();
      });

      it('should throw NotFoundError when article does not exist', async () => {
        db.article.findUnique.mockResolvedValue(null);

        await expect(
          service.update(
            'not_exist',
            { title: 'Updated' },
            userId,
            UserRole.admin,
          ),
        ).rejects.toThrow(NotFoundError);
      });

      it('should disconnect category when categoryId is not provided', async () => {
        await service.update(
          articleId,
          { title: 'Updated' },
          userId,
          UserRole.admin,
        );

        expect(db.article.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              category: { disconnect: true },
            }),
          }),
        );
      });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundError when article does not exist', async () => {
      db.article.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should delete comments and article in a transaction', async () => {
      const txComment = { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) };
      const txArticle = { delete: vi.fn().mockResolvedValue(articleDB) };

      db.$transaction.mockImplementation(async (cb: any) =>
        cb({ comment: txComment, article: txArticle }),
      );

      await service.remove(articleId);

      expect(txComment.deleteMany).toHaveBeenCalledWith({
        where: { articleId },
      });
      expect(txArticle.delete).toHaveBeenCalledWith({
        where: { id: articleId },
      });
    });
  });
});

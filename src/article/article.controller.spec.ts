import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleStatus, CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

const articleId = '3fa85f64-5717-4562-b3fc-2c913f66afa1';

const article = {
  id: articleId,
  title: 'Title #1',
  content: 'Content #1',
  status: ArticleStatus.PUBLISHED,
  authorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  categoryId: 'a1b2c3d4-e29b-41d4-a716-446655440000',
  tags: ['1', '2', '3'],
  createdAt: 99999999999,
  updatedAt: 99999999999,
};

const dto: CreateArticleDto = {
  title: article.title,
  content: article.content,
  status: article.status,
  authorId: article.authorId,
  categoryId: article.categoryId,
  tags: article.tags,
};

const updateDto: UpdateArticleDto = { title: 'Updated Title' };

describe('Article Controller', () => {
  let controller: ArticleController;
  let service: ArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService,
          useValue: {
            findAll: jest.fn().mockReturnValue([article]),

            findById: jest.fn().mockReturnValue(article),

            create: jest.fn().mockReturnValue(article),

            update: jest.fn().mockReturnValue({ ...article, ...updateDto }),

            remove: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of articles', () => {
    const result = controller.findAll({});

    expect(result).toEqual([article]);
  });

  it('should return a single article by id', () => {
    const result = controller.findOne(articleId);

    expect(result).toEqual(article);
  });

  it('should throw an exception if article not found', () => {
    jest.spyOn(service, 'findById').mockImplementationOnce(() => {
      throw new NotFoundException('Article not found');
    });

    expect(() =>
      controller.findOne('3fa85f64-5717-4562-b3fc-2c913f66afa2'),
    ).toThrow('Article not found');
  });

  it('should create a new article', () => {
    const result = controller.create(dto);

    expect(result).toEqual(article);
  });

  it('should update an article', () => {
    const result = controller.update(articleId, updateDto);

    expect(result).toEqual({ ...article, ...updateDto });
  });

  it('should remove an article', () => {
    const result = controller.remove(articleId);

    expect(result).toBeUndefined();
  });
});

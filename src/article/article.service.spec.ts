import { ArticleStorageService } from '../database/article.storage.service';
import { CommentStorageService } from '../database/comment.storage.service';
import { ArticleService } from './article.service';
import { ArticleStatus, CreateArticleDto } from './dto/create-article.dto';
import { Test, TestingModule } from '@nestjs/testing';

const articleId = '3fa85f64-5717-4562-b3fc-2c913f66afa1';

const articles: (CreateArticleDto & { id: string })[] = [
  {
    id: articleId,
    title: 'Title #1',
    content: 'Content #1',
    status: ArticleStatus.PUBLISHED,
    authorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    categoryId: 'a1b2c3d4-e29b-41d4-a716-446655440000',
    tags: ['1', '2', '3'],
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c913f66afa2',
    title: 'Title #2',
    content: 'Content #2',
    status: ArticleStatus.DRAFT,
    authorId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    categoryId: 'b2c3d4e5-e29b-41d4-a716-446655440111',
    tags: ['one', 'two', 'three'],
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c913f66afa3',
    title: 'Title #3',
    content: 'Content #3',
    status: ArticleStatus.ARCHIVED,
    authorId: '16fd2706-8baf-433b-82eb-8c7fada847da',
    categoryId: 'c3d4e5f6-e29b-41d4-a716-446655440222',
    tags: ['ahat', 'shtaim', 'shalosh'],
  },
];

const article: CreateArticleDto = articles[0];

const dto: CreateArticleDto = {
  title: article.title,
  content: article.content,
  status: article.status,
  authorId: article.authorId,
  categoryId: article.categoryId,
  tags: article.tags,
};

const db = {
  article: {
    findAll: jest.fn().mockReturnValue(articles),
    findById: jest.fn().mockReturnValue(articles[0]),
    create: jest.fn(),
  },
};

describe('Article Service', () => {
  let service: ArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: ArticleStorageService,
          useValue: db.article,
        },
        {
          provide: CommentStorageService,
          useValue: {
            findAll: jest.fn().mockReturnValue([]),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an array of articles', () => {
    const result = service.findAll({});
    expect(result).toEqual(articles);
  });

  it('should return a single article by id', () => {
    expect(service.findById(articleId)).toEqual(articles[0]);
  });

  it('should create a new artist', () => {
    expect(service.create(dto)).toEqual(expect.objectContaining(dto));
  });
});

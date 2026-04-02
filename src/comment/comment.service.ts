import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentStorageService } from '../database/comment.storage.service';
import { ArticleStorageService } from '../database/article.storage.service';
import { randomUUID } from 'crypto';
import { Comment } from './comment.interface';
import { GetCommentsQueryDto } from './dto/get-comments-query';

@Injectable()
export class CommentService {
  constructor(
    private readonly articleStorage: ArticleStorageService,
    private readonly commentStorage: CommentStorageService,
  ) {}

  findAll(query: GetCommentsQueryDto) {
    const article = this.articleStorage.findById(query.articleId);

    if (!article) {
      throw new NotFoundException('Article with id not found');
    }

    let comments = this.commentStorage.findAll();

    if (query.articleId) {
      comments = comments.filter(
        (comment) => comment.articleId === query.articleId,
      );
    }

    return comments;
  }

  create(dto: CreateCommentDto) {
    const article = this.articleStorage.findById(dto.articleId);

    if (!article) {
      throw new UnprocessableEntityException('Article with this id not found');
    }

    const id = randomUUID();
    const now = Date.now();

    const newComment: Comment = {
      id,
      content: dto.content,
      articleId: dto.articleId,
      authorId: dto.authorId ?? null,
      createdAt: now,
    };

    this.commentStorage.create(newComment);

    return newComment;
  }

  findOne(id: string) {
    const comment = this.commentStorage.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  remove(id: string) {
    const deleted = this.commentStorage.delete(id);

    if (!deleted) {
      throw new NotFoundException('Comment not found');
    }
  }
}

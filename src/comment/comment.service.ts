import { Injectable } from '@nestjs/common';
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../common/errors/app.error';
import { UserRole } from '../generated/prisma/enums';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  private toResponse(comment: {
    id: string;
    content: string;
    articleId: string;
    authorId: string | null;
    createdAt: Date;
  }) {
    return {
      id: comment.id,
      content: comment.content,
      articleId: comment.articleId,
      authorId: comment.authorId,
      createdAt: comment.createdAt.getTime(),
    };
  }

  async findAll(query: GetCommentsQueryDto) {
    const comments = await this.prismaService.comment.findMany({
      where: { articleId: query.articleId },
    });

    return comments.map((c) => this.toResponse(c));
  }

  async create(dto: CreateCommentDto, currentUserId: string) {
    const article = await this.prismaService.article.findUnique({
      where: { id: dto.articleId },
    });

    if (!article) {
      throw new UnprocessableEntityError('Article with this id not found');
    }

    const authorId = dto.authorId !== undefined ? dto.authorId : currentUserId;

    const comment = await this.prismaService.comment.create({
      data: {
        content: dto.content,
        article: { connect: { id: dto.articleId } },
        author: authorId ? { connect: { id: authorId } } : undefined,
      },
    });

    return this.toResponse(comment);
  }

  async findOne(id: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    return this.toResponse(comment);
  }

  async remove(id: string, currentUserId: string, currentUserRole: UserRole) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (
      currentUserRole !== UserRole.admin &&
      comment.authorId !== currentUserId
    ) {
      throw new ForbiddenError(
        'You do not have permission to delete this comment',
      );
    }

    await this.prismaService.comment.delete({ where: { id } });
  }
}

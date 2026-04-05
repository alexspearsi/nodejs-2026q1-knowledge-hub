import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateComment,
  ApiDeleteComment,
  ApiGetCommentById,
  ApiGetComments,
} from '../common/decorators/comment.decorator';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiGetComments()
  @Get()
  findAll(@Query() query: GetCommentsQueryDto) {
    return this.commentService.findAll(query);
  }

  @ApiGetCommentById()
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findOne(id);
  }

  @ApiCreateComment()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @ApiDeleteComment()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.remove(id);
  }
}

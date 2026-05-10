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
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsQueryDto } from './dto/get-comments-query';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateComment,
  ApiDeleteComment,
  ApiGetCommentById,
  ApiGetComments,
} from '../common/decorators/comment.decorator';
import { JwtGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';
import { User } from '../user/user.interface';

@ApiTags('Comment')
@ApiBearerAuth()
@Controller('comment')
@UseGuards(JwtGuard, RolesGuard)
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
  @Roles(UserRole.editor, UserRole.admin)
  create(@Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.commentService.create(dto, user.id);
  }

  @ApiDeleteComment()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.editor, UserRole.admin)
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ) {
    return this.commentService.remove(id, user.id, user.role as UserRole);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateArticle,
  ApiDeleteArticle,
  ApiGetArticleById,
  ApiGetArticles,
  ApiUpdateArticle,
} from '../common/decorators/article.decorator';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../generated/prisma/enums';
import { User } from '../user/user.interface';

@ApiTags('Articles')
@ApiBearerAuth()
@Controller('article')
@UseGuards(JwtGuard, RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiGetArticles()
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: GetArticlesQueryDto) {
    return this.articleService.findAll(query);
  }

  @ApiGetArticleById()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articleService.findById(id);
  }

  @ApiCreateArticle()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.editor, UserRole.admin)
  create(@Body() dto: CreateArticleDto, @CurrentUser() user: User) {
    return this.articleService.create(dto, user.id);
  }

  @ApiUpdateArticle()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.editor, UserRole.admin)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: User,
  ) {
    return this.articleService.update(id, dto, user.id, user.role);
  }

  @ApiDeleteArticle()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.admin)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articleService.remove(id);
  }
}

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
import { ApiTags } from '@nestjs/swagger';
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
import { User } from '../user/user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Articles')
@Controller('article')
@UseGuards(JwtGuard)
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
  create(@Body() dto: CreateArticleDto, @CurrentUser() user: User) {
    return this.articleService.create(dto, user.id);
  }

  @ApiUpdateArticle()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articleService.update(id, dto);
  }

  @ApiDeleteArticle()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.articleService.remove(id);
  }
}

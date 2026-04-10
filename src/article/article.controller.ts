import {
  Body,
  Controller,
  Get,
  // Post,
  // Body,
  // Param,
  // Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  // Put,
  // ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
// import { CreateArticleDto } from './dto/create-article.dto';
// import { UpdateArticleDto } from './dto/update-article.dto';
import { GetArticlesQueryDto } from './dto/get-articles-query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateArticle,
  ApiGetArticleById,
  // ApiCreateArticle,
  // ApiDeleteArticle,
  // ApiGetArticleById,
  ApiGetArticles,
  ApiUpdateArticle,
  // ApiUpdateArticle,
} from '../common/decorators/article.decorator';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller('article')
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
  create(@Body() dto: CreateArticleDto) {
    return this.articleService.create(dto);
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

  // @ApiDeleteArticle()
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
  //   return this.articleService.remove(id);
  // }
}

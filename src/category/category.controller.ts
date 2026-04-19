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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateCategory,
  ApiDeleteCategory,
  ApiGetCategories,
  ApiGetCategoryById,
  ApiUpdateCategory,
} from '../common/decorators/category.decorator';
import { GetCategoriesQueryDto } from './dto/get-category-query.dto';
import { JwtGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/prisma/enums';

@ApiTags('Category')
@Controller('category')
@UseGuards(JwtGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiGetCategories()
  @Get()
  findAll(@Query() query: GetCategoriesQueryDto) {
    return this.categoryService.findAll(query);
  }

  @ApiGetCategoryById()
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoryService.findById(id);
  }

  @ApiCreateCategory()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.admin)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @ApiUpdateCategory()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.admin)
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

  @ApiDeleteCategory()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.admin)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoryService.remove(id);
  }
}

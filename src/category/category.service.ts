import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryStorageService } from '../database/category.storage.service';
import { randomUUID } from 'crypto';
import { Category } from './category.interface';
import { ArticleStorageService } from '../database/article.storage.service';
import { GetCategoriesQueryDto } from './dto/get-category-query.dto';
import { SortOrder } from '../common/types';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryStorage: CategoryStorageService,
    private readonly articleStorage: ArticleStorageService,
  ) {}

  findAll(query: GetCategoriesQueryDto) {
    let categories = this.categoryStorage.findAll();

    if (query.sortBy) {
      const order = query.order ?? SortOrder.DESC;
      categories = [...categories].sort((a, b) => {
        const first = a[query.sortBy];
        const second = b[query.sortBy];

        if (first < second) {
          return order === SortOrder.ASC ? -1 : 1;
        }

        if (first > second) {
          return order === SortOrder.ASC ? 1 : -1;
        }

        return 0;
      });
    }

    if (query.page !== undefined || query.limit !== undefined) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const total = categories.length;
      const data = categories.slice((page - 1) * limit, page * limit);

      return { total, page, limit, data };
    }

    return categories;
  }

  findById(id: string) {
    const category = this.categoryStorage.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  create(dto: CreateCategoryDto) {
    const id = randomUUID();

    const newCategory: Category = {
      id,
      name: dto.name,
      description: dto.description,
    };

    this.categoryStorage.create(newCategory);

    return newCategory;
  }

  update(id: string, dto: UpdateCategoryDto) {
    const category = this.findById(id);

    Object.assign(category, dto);

    return category;
  }

  remove(id: string) {
    const deleted = this.categoryStorage.delete(id);

    if (!deleted) {
      throw new NotFoundException('Category not found');
    }

    this.articleStorage
      .findAll()
      .filter((article) => article.categoryId === id)
      .forEach((article) => {
        article.categoryId = null;
        article.updatedAt = Date.now();
      });
  }
}

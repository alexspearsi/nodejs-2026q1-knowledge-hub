import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryStorageService } from '../database/category.storage.service';
import { randomUUID } from 'crypto';
import { Category } from './category.interface';
import { ArticleStorageService } from '../database/article.storage.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryStorage: CategoryStorageService,
    private readonly articleStorage: ArticleStorageService,
  ) {}

  findAll() {
    return this.categoryStorage.findAll();
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

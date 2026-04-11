import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCategoriesQueryDto } from './dto/get-category-query.dto';
import { SortOrder } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query?: GetCategoriesQueryDto) {
    let categories = await this.prismaService.category.findMany();

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

  async findById(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const category = await this.prismaService.category.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    const category = await this.prismaService.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return category;
  }

  async remove(id: string) {
    await this.findById(id);

    await this.prismaService.$transaction([
      this.prismaService.article.updateMany({
        where: {
          categoryId: id,
        },
        data: {
          categoryId: null,
        },
      }),

      this.prismaService.category.delete({
        where: { id },
      }),
    ]);
  }
}

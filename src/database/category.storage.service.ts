import { Category } from '../category/category.interface';
import { BaseStorageService } from './base.storage.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryStorageService extends BaseStorageService<Category> {}

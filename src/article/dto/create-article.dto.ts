import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @IsOptional()
  @IsUUID()
  authorId: string | null;

  @IsOptional()
  @IsUUID()
  categoryId: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

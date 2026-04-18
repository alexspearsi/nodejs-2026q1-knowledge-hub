import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
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
  @ApiProperty({ example: 'NestJS Guide', description: 'Article title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Full guide...',
    description: 'Full article content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    enum: ArticleStatus,
    example: ArticleStatus.PUBLISHED,
    description: 'Publication status of the article',
    required: false,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the author (user) of this article',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  authorId?: string | null;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID of the category this article belongs to',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiProperty({
    example: ['nestjs', 'backend'],
    description: 'List of tags associated with the article (max 10, unique)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}

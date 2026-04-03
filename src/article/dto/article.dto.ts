import { ApiProperty } from '@nestjs/swagger';

export class ArticleDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status: 'draft' | 'published' | 'archived';

  @ApiProperty({ nullable: true })
  authorId: string | null;

  @ApiProperty({ nullable: true })
  categoryId: string | null;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  createdAt: number;

  @ApiProperty()
  updatedAt: number;
}

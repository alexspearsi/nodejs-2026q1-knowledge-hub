import { ApiProperty } from '@nestjs/swagger';
import { ArticleDto } from './article.dto';

export class PaginationResponseDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ type: [ArticleDto] })
  data: ArticleDto[];
}

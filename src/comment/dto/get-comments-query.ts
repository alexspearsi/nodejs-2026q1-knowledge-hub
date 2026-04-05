import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsUUID } from 'class-validator';

export class GetCommentsQueryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Article ID to filter comments',
  })
  @IsDefined()
  @IsUUID('4')
  articleId: string;
}

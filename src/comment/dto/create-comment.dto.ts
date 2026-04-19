import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'This is a comment',
    description: 'Text content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the article this comment belongs to',
  })
  @IsUUID('4')
  articleId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the comment author. Pass null for anonymous.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4')
  authorId?: string | null;
}

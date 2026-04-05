import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Backend',
    description: 'Category name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Backend related topics',
    description: 'Category description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

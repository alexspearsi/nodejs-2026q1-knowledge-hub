import { IsOptional, IsString } from 'class-validator';

export class AnalyzeArticleDto {
  @IsString()
  @IsOptional()
  task?: 'review' | 'bugs' | 'optimize' | 'explain';
}

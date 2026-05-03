import { IsEnum, IsOptional } from 'class-validator';

export enum AnalyzeTask {
  Review = 'review',
  Bugs = 'bugs',
  Optimize = 'optimize',
  Explain = 'explain',
}

export class AnalyzeArticleDto {
  @IsEnum(AnalyzeTask)
  @IsOptional()
  task?: AnalyzeTask;
}

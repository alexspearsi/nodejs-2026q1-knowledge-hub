import { IsArray, IsEnum, IsOptional } from 'class-validator';

export enum AnalysisAspect {
  Sentiment = 'sentiment',
  Topics = 'topics',
  Keywords = 'keywords',
  Readability = 'readability',
  Summary = 'summary',
}

export class AnalyzeArticleDto {
  @IsOptional()
  @IsArray()
  @IsEnum(AnalysisAspect, { each: true })
  aspects?: AnalysisAspect[];
}

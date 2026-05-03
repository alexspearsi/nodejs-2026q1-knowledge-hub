import { AnalysisAspect } from './analyze-article.dto';

export class AnalyzeArticleResponseDto {
  articleId: string;
  results: Partial<Record<AnalysisAspect, string | string[]>>;
}

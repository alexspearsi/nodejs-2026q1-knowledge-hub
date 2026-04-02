import { IsDefined, IsUUID } from 'class-validator';

export class GetCommentsQueryDto {
  @IsDefined()
  @IsUUID()
  articleId: string;
}

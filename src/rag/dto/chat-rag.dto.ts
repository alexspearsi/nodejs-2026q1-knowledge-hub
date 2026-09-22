import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ChatRagDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsUUID('4')
  conversationId?: string;
}

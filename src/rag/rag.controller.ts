import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { IndexRagDto } from './dto/index-rag.dto';
import { SearchRagDto } from './dto/search-rag.dto';
import { ChatRagDto } from './dto/chat-rag.dto';
import {
  ApiRagChat,
  ApiRagDeleteArticle,
  ApiRagHistory,
  ApiRagIndex,
  ApiRagSearch,
} from '../common/decorators/rag.decorator';

@ApiTags('RAG')
@Controller('ai/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @ApiRagIndex()
  @Post('index')
  @HttpCode(HttpStatus.OK)
  index(@Body() dto: IndexRagDto) {
    return this.ragService.index(dto);
  }

  @ApiRagSearch()
  @Post('search')
  @HttpCode(HttpStatus.OK)
  search(@Body() dto: SearchRagDto) {
    return this.ragService.search(dto);
  }

  @ApiRagChat()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() dto: ChatRagDto) {
    return this.ragService.chat(dto);
  }

  @ApiRagDeleteArticle()
  @Delete('index/articles/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArticle(
    @Param('articleId', new ParseUUIDPipe({ version: '4' })) articleId: string,
  ) {
    return this.ragService.deleteArticle(articleId);
  }

  @ApiRagHistory()
  @Get('chat/:conversationId/history')
  getHistory(
    @Param('conversationId', new ParseUUIDPipe({ version: '4' }))
    conversationId: string,
  ) {
    return this.ragService.getHistory(conversationId);
  }
}

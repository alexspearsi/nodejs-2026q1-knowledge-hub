import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { VectorDbService } from './vector-db.service';
import { ConversationService } from './conversation.service';
import { IndexRagDto } from './dto/index-rag.dto';
import { SearchRagDto } from './dto/search-rag.dto';
import { ChatRagDto } from './dto/chat-rag.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RagService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chunking: ChunkingService,
    private readonly embedding: EmbeddingService,
    private readonly vectorDb: VectorDbService,
    private readonly conversation: ConversationService,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.baseUrl = this.config.get<string>('GEMINI_API_BASE_URL');
    this.model = this.config.get<string>('GEMINI_MODEL', 'gemini-2.0-flash');
  }

  async index(dto: IndexRagDto) {
    const articles = await this.prisma.article.findMany({
      where: {
        ...(dto.onlyPublished !== false && { status: 'published' }),
        ...(dto.articleIds?.length && { id: { in: dto.articleIds } }),
      },
      include: { tags: true },
    });

    let indexedChunks = 0;

    for (const article of articles) {
      const text = `${article.title}\n\n${article.content}`;
      const chunks = this.chunking.chunk(text);

      await this.vectorDb.deletedByArticleId(article.id);

      const points = await Promise.all(
        chunks.map(async (chunk, i) => {
          const vector = await this.embedding.embed(chunk);

          return {
            id: uuidv4(),
            vector,
            payload: {
              articleId: article.id,
              articleTitle: article.title,
              chunk,
              chunkIndex: i,
              status: article.status,
              categoryId: article.categoryId ?? undefined,
              tags: article.tags.map((tag) => tag.name),
            },
          };
        }),
      );

      await this.vectorDb.upsertPoints(points);

      indexedChunks += chunks.length;
    }

    return {
      indexedArticles: articles.length,
      indexedChunks,
      vectorCollection: this.vectorDb.getCollectionName(),
    };
  }

  async search(dto: SearchRagDto) {
    const vector = await this.embedding.embed(dto.query);

    const filter = this.buildFilter(dto);

    const results = await this.vectorDb.search(vector, dto.limit ?? 5, filter);

    return {
      results: results.map((result) => ({
        articleId: result.payload.articleId,
        articleTitle: result.payload.articleTitle,
        chunk: result.payload.chunk,
        similarity: result.score,
      })),
    };
  }

  private buildFilter(dto: SearchRagDto) {
    const must: any[] = [];

    if (dto.articleStatus) {
      must.push({ key: 'status', match: { value: dto.articleStatus } });
    }

    if (dto.categoryId) {
      must.push({ key: 'categoryId', match: { value: dto.categoryId } });
    }

    if (dto.tags?.length) {
      must.push({ key: 'tags', match: { any: dto.tags } });
    }

    return must.length ? { must } : undefined;
  }

  async chat(dto: ChatRagDto) {
    const conversationId = this.conversation.getOrCreate(dto.conversationId);

    const vector = await this.embedding.embed(dto.question);
    const results = await this.vectorDb.search(vector, 5);

    const sources = results.map((result) => ({
      articleId: result.payload.articleId,
      articleTitle: result.payload.articleTitle,
      relevantChunk: result.payload.chunk,
    }));

    const context = results
      .map((r) => `[${r.payload.articleTitle}]\n${r.payload.chunk}`)
      .join('\n\n---\n\n');

    const history = this.conversation.getHistory(conversationId);

    const historyText = history.map(
      (el) => `${el.roles === 'user' ? 'User' : 'Assistant'}: ${el.content}`,
    );

    const prompt = `You are a helpful assistant for a Knowledge Hub.
Use ONLY the context below to answer the question.
If the answer is not in the context, say you don't know.

CONTEXT:
${context}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ''}
User: ${dto.question}
Assistant:`;

    const answer = await this.callGemini(prompt);

    this.conversation.addMessage(conversationId, {
      roles: 'user',
      content: dto.question,
    });

    this.conversation.addMessage(conversationId, {
      roles: 'assistant',
      content: answer,
    });

    return { answer, sources, conversationId };
  }

  private async callGemini(prompt: string) {
    const url = `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, { timeout: 30000 }),
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch {
      throw new ServiceUnavailableException('AI service is unavailable');
    }
  }

  async deleteArticle(articleId: string) {
    const count = await this.vectorDb.countByArticleId(articleId);

    if (count === 0) {
      throw new NotFoundException(
        `No index entries found for article ${articleId}`,
      );
    }

    await this.vectorDb.deletedByArticleId(articleId);
  }

  getHistory(conversationId: string) {
    return this.conversation.getHistory(conversationId);
  }
}

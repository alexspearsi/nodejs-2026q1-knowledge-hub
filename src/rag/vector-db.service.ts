import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface PointPayload {
  [key: string]: unknown;
  articleId: string;
  articleTitle: string;
  chunk: string;
  chunkIndex: number;
  status: string;
  categoryId?: string;
  tags?: string[];
}

@Injectable()
export class VectorDbService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly collection: string;
  private readonly vectorSize = 3072;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>(
      'RAG_VECTOR_DB_URL',
      'http://localhost:6333',
    );

    this.collection = this.configService.get<string>(
      'RAG_VECTOR_COLLECTION',
      'knowledge_hub_articles',
    );

    this.client = new QdrantClient({ url });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      const existing = await this.client.collectionExists(this.collection);

      if (!existing.exists) {
        await this.client.createCollection(this.collection, {
          vectors: { size: this.vectorSize, distance: 'Cosine' },
        });
      }
    } catch {
      throw new ServiceUnavailableException('Vector DB is unavailable');
    }
  }

  async upsertPoints(
    points: Array<{ id: string; vector: number[]; payload: PointPayload }>,
  ) {
    try {
      await this.client.upsert(this.collection, {
        wait: true,
        points,
      });
    } catch {
      throw new ServiceUnavailableException('Vector DB is unavailable');
    }
  }

  async search(vector: number[], limit: number, filter?: Record<string, any>) {
    try {
      return await this.client.search(this.collection, {
        vector,
        limit,
        filter,
        with_payload: true,
      });
    } catch {
      throw new ServiceUnavailableException('Vector DB is unavailable');
    }
  }

  async deletedByArticleId(articleId: string) {
    try {
      await this.client.delete(this.collection, {
        wait: true,
        filter: {
          must: [{ key: 'articleId', match: { value: articleId } }],
        },
      });
    } catch {
      throw new ServiceUnavailableException('Vector DB is unavailable');
    }
  }

  async countByArticleId(articleId: string): Promise<number> {
    const result = await this.client.count(this.collection, {
      filter: {
        must: [{ key: 'articleId', match: { value: articleId } }],
      },
    });

    return result.count;
  }

  getCollectionName() {
    return this.collection;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChunkingService {
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(private readonly configService: ConfigService) {
    this.chunkSize = this.configService.get<number>('RAG_CHUNK_SIZE', 800);
    this.chunkOverlap = this.configService.get<number>(
      'RAG_CHUNK_OVERLAP',
      200,
    );
  }

  chunk(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + this.chunkSize;

      chunks.push(text.slice(start, end));

      start += this.chunkSize - this.chunkOverlap;
    }

    return chunks.filter((chunk) => chunk.trim().length > 0);
  }
}

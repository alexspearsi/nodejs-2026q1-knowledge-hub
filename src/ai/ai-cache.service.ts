import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AICacheService {
  private readonly store = new Map<
    string,
    { value: unknown; expiresAt: number }
  >();
  private readonly ttlMs: number;

  constructor(configService: ConfigService) {
    this.ttlMs = configService.getOrThrow<number>('AI_CACHE_TTL_SEC') * 1000;
  }

  get(key: string) {
    const entry = this.store.get(key);

    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: unknown) {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

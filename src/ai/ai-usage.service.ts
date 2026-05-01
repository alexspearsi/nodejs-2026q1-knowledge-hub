import { Injectable } from '@nestjs/common';

@Injectable()
export class AiUsageService {
  private total = 0;
  private readonly endpoints = new Map<string, number>();

  track(endpoint: string): void {
    this.total++;
    this.endpoints.set(endpoint, (this.endpoints.get(endpoint) ?? 0) + 1);
  }

  getStats() {
    return {
      total: this.total,
      byEndpoint: Object.fromEntries(this.endpoints),
    };
  }
}

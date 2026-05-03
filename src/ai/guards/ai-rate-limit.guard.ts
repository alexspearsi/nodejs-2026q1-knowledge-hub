import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIRateLimitGuard implements CanActivate {
  private readonly requests = new Map<string, number[]>();
  private readonly requestsPerMinute: number;

  constructor(private readonly configService: ConfigService) {
    this.requestsPerMinute = this.configService.getOrThrow('AI_RATE_LIMIT_RPM');
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const key: string = req.ip ?? 'global';
    const now = Date.now();
    const windowMs = 60000;

    const timestamps = (this.requests.get(key) ?? []).filter(
      (time) => now - time < windowMs,
    );

    if (timestamps.length >= this.requestsPerMinute) {
      const retryAfter = Math.ceil((windowMs - (now - timestamps[0])) / 1000);

      res.header('Retry-After', String(retryAfter));

      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    timestamps.push(now);

    this.requests.set(key, timestamps);

    return true;
  }
}

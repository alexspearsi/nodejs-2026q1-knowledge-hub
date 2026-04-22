import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { CustomLogger } from '../logger/logger.service';

const SENSITIVE_KEYS = [
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'authorization',
];

function redactSensitiveFields(
  body: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      SENSITIVE_KEYS.includes(key.toLowerCase()) ? '[REDACTED]' : value,
    ]),
  );
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url, query, body } = req;
    const start = Date.now();

    this.logger.log(
      `${method} ${url} | query: ${JSON.stringify(query)} | body: ${JSON.stringify(redactSensitiveFields(body))}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${method} ${url} | ${res.statusCode} | ${Date.now() - start}ms`,
          'HTTP',
        );
      }),
    );
  }
}

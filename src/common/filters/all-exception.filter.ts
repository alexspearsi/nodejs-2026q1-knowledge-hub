import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '../logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const res = exception.getResponse();

      const body =
        typeof res === 'string'
          ? { message: res, error: undefined }
          : (res as Record<string, unknown>);

      message = Array.isArray(body.message)
        ? (body.message as string[]).join('; ')
        : String(body.message ?? message);

      error = typeof body.error === 'string' ? body.error : 'Http Exception';
    }

    const stack = exception instanceof Error ? exception.stack : undefined;

    const logMessage = `${request.method} ${request.url} ${statusCode}`;

    if (statusCode >= 500) {
      this.logger.error(logMessage, stack, 'ExceptionFilter');
    } else {
      this.logger.warn(`${logMessage} — ${message}`, 'ExceptionFilter');
    }

    response.status(statusCode).json({ statusCode, error, message });
  }
}

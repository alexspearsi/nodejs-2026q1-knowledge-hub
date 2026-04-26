import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exception.filter';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  UnprocessableEntityError,
} from '../errors/app.error';
import { HttpException, HttpStatus } from '@nestjs/common';

const loggerMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

const makeHost = (method = 'GET', url = '/test') => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return {
    switchToHttp: () => ({
      getResponse: () => ({ status, json }),
      getRequest: () => ({ method, url }),
    }),
    json: json,
    status: status,
  };
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    vi.clearAllMocks();

    filter = new AllExceptionsFilter(loggerMock as any);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should return 500 for unknown errors', () => {
    const host = makeHost();

    filter.catch(new Error('unexpected'), host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500 }),
    );
  });

  it('should return 404 with message for NotFoundError', () => {
    const host = makeHost();

    filter.catch(new NotFoundError('User not found'), host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, message: 'User not found' }),
    );
  });

  it('should return 403 with message for ForbiddenError', () => {
    const host = makeHost();

    filter.catch(new ForbiddenError('Access denied'), host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403, message: 'Access denied' }),
    );
  });

  it('should return 400 with error title for ValidationError', () => {
    const host = makeHost();

    filter.catch(new ValidationError('Invalid input'), host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, error: 'Validation Error' }),
    );
  });

  it('should handle HttpException and extract message', () => {
    const host = makeHost();

    filter.catch(
      new HttpException('Bad Request', HttpStatus.BAD_REQUEST),
      host as any,
    );

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('should join array messages from HttpException', () => {
    const host = makeHost();

    filter.catch(
      new HttpException(
        {
          message: ['field is required', 'field must be string'],
          error: 'Bad Request',
        },
        400,
      ),
      host as any,
    );

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'field is required; field must be string',
      }),
    );
  });

  it('should call logger.error for 5xx errors', () => {
    const host = makeHost();

    filter.catch(new Error('crash'), host as any);

    expect(loggerMock.error).toHaveBeenCalled();
  });

  it('should call logger.warn for 4xx errors', () => {
    const host = makeHost();

    filter.catch(new NotFoundError(), host as any);

    expect(loggerMock.warn).toHaveBeenCalled();
  });

  it('should return 422 for UnprocessableEntityError', () => {
    const host = makeHost();

    filter.catch(new UnprocessableEntityError('Cannot process'), host as any);

    expect(host.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 422, message: 'Cannot process' }),
    );
  });
});

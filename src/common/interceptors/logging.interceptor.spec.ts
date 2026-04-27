import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggingInterceptor } from './logging.interceptor';
import { of } from 'rxjs';

const loggerMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

const makeContext = (body: object = {}) => ({
  switchToHttp: () => ({
    getRequest: () => ({ method: 'POST', url: '/test', query: {}, body }),
    getResponse: () => ({ statusCode: 200 }),
  }),
});

const makeNext = () => ({ handle: () => of(null) });

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    vi.clearAllMocks();

    interceptor = new LoggingInterceptor(loggerMock as any);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should call logger.log on request', () => {
    interceptor.intercept(makeContext() as any, makeNext() as any).subscribe();

    expect(loggerMock.log).toHaveBeenCalled();
  });

  it('should redact password from request body', () => {
    interceptor
      .intercept(
        makeContext({ login: 'alex', password: 'secret123' }) as any,
        makeNext() as any,
      )
      .subscribe();

    const logCall = loggerMock.log.mock.calls[0][0] as string;

    expect(logCall).toContain('[REDACTED]');
    expect(logCall).not.toContain('secret123');
  });

  it('should not redact non-sensitive fields', () => {
    interceptor
      .intercept(
        makeContext({ login: 'alex', title: 'My Article' }) as any,
        makeNext() as any,
      )
      .subscribe();

    const logCall = loggerMock.log.mock.calls[0][0] as string;

    expect(logCall).toContain('alex');
    expect(logCall).toContain('My Article');
  });

  it('should redact token field', () => {
    interceptor
      .intercept(
        makeContext({ token: 'super_secret_token' }) as any,
        makeNext() as any,
      )
      .subscribe();

    const logCall = loggerMock.log.mock.calls[0][0] as string;

    expect(logCall).not.toContain('super_secret_token');
  });

  it('should log response status after handler completes', () => {
    interceptor.intercept(makeContext() as any, makeNext() as any).subscribe();

    expect(loggerMock.log).toHaveBeenCalledTimes(2);
  });
});

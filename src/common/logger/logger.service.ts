import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const LOGGER_LEVELS: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];

@Injectable()
export class CustomLogger extends ConsoleLogger {
  private readonly LOG_LEVEL;
  private readonly NODE_ENV;

  private readonly logPath = join(__dirname, '../../../logs/logs.log');
  private readonly minLevel: LogLevel;
  private readonly isProd: boolean;

  constructor(private readonly configService: ConfigService) {
    super();
    this.LOG_LEVEL = configService.get('LOG_LEVEL');
    this.NODE_ENV = configService.get('NODE_ENV');

    const envLevel = (this.LOG_LEVEL as LogLevel) ?? 'log';

    this.minLevel = LOGGER_LEVELS.includes(envLevel) ? envLevel : 'log';
    this.isProd = this.NODE_ENV === 'production';
  }

  log(message: any, context?: string) {
    if (!this.isEnabled('log')) {
      return;
    }

    this.writeToFile('log', message, context);
    super.log(message, context);
  }

  error(message: any, trace?: string, context?: string) {
    if (!this.isEnabled('error')) {
      return;
    }

    this.writeToFile('error', message, context, trace);
    super.error(message, trace, context);
  }

  warn(message: any, context?: string) {
    if (!this.isEnabled('warn')) {
      return;
    }

    this.writeToFile('warn', message, context);
    super.warn(message, context);
  }

  debug(message: any, context?: string) {
    if (!this.isEnabled('debug')) {
      return;
    }

    this.writeToFile('debug', message, context);
    super.debug(message, context);
  }

  verbose(message: any, context?: string) {
    if (!this.isEnabled('verbose')) {
      return;
    }

    this.writeToFile('verbose', message, context);
    super.verbose(message, context);
  }

  private isEnabled(level: LogLevel): boolean {
    return LOGGER_LEVELS.indexOf(level) >= LOGGER_LEVELS.indexOf(this.minLevel);
  }

  private writeToFile(
    level: LogLevel,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const time = new Date().toISOString();

    const entry = this.isProd
      ? JSON.stringify({ time, level, context, message, trace }) + '\n'
      : `[${time}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}${trace ? `\nTRACE: ${trace}` : ''}\n`;

    const logDir = dirname(this.logPath);

    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    appendFileSync(this.logPath, entry);
  }
}

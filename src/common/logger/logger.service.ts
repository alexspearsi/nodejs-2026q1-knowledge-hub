import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createStream, RotatingFileStream } from 'rotating-file-stream';

const LOGGER_LEVELS: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];

@Injectable()
export class CustomLogger extends ConsoleLogger {
  private readonly LOG_LEVEL: string;
  private readonly NODE_ENV: string;
  private readonly LOG_MAX_FILE_SIZE: string;

  private readonly logPath = join(__dirname, '../../../logs/logs.log');
  private readonly minLevel: LogLevel;
  private readonly isProd: boolean;

  private fileStream!: RotatingFileStream;

  constructor(private readonly configService: ConfigService) {
    super();

    this.LOG_LEVEL = this.configService.get('LOG_LEVEL') ?? 'log';
    this.NODE_ENV = this.configService.get('NODE_ENV') ?? 'development';
    this.LOG_MAX_FILE_SIZE =
      this.configService.get('LOG_MAX_FILE_SIZE') ?? '1024';

    const envLevel = this.LOG_LEVEL as LogLevel;

    this.minLevel = LOGGER_LEVELS.includes(envLevel) ? envLevel : 'log';
    this.isProd = this.NODE_ENV === 'production';

    this.initFileStream();
  }

  private initFileStream() {
    const logDir = dirname(this.logPath);

    mkdirSync(logDir, { recursive: true });

    const maxSizeKB = Number(this.LOG_MAX_FILE_SIZE) || 1024;

    const generator = (time?: number | Date) => {
      if (!time) return 'logs.log';

      const date = new Date(time)
        .toISOString()
        .replace(/:/g, '-')
        .split('.')[0];

      return `logs-${date}.log`;
    };

    this.fileStream = createStream(generator, {
      size: `${maxSizeKB}K`,
      path: logDir,
    });
  }

  log(message: any, context?: string) {
    if (!this.isEnabled('log')) return;

    this.writeToFile('log', message, context);
    super.log(message, context);
  }

  error(message: any, trace?: string, context?: string) {
    if (!this.isEnabled('error')) return;

    this.writeToFile('error', message, context, trace);
    super.error(message, trace, context);
  }

  warn(message: any, context?: string) {
    if (!this.isEnabled('warn')) return;

    this.writeToFile('warn', message, context);
    super.warn(message, context);
  }

  debug(message: any, context?: string) {
    if (!this.isEnabled('debug')) return;

    this.writeToFile('debug', message, context);
    super.debug(message, context);
  }

  verbose(message: any, context?: string) {
    if (!this.isEnabled('verbose')) return;

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
      : `[${time}] [${level.toUpperCase()}]${
          context ? ` [${context}]` : ''
        } ${message}${trace ? `\nTRACE: ${trace}` : ''}\n`;

    this.fileStream.write(entry);
  }
}

import { Module } from '@nestjs/common';
import { CustomLogger } from './logger.service';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

@Module({
  providers: [CustomLogger, LoggingInterceptor],
  exports: [CustomLogger, LoggingInterceptor],
})
export class LoggerModule {}

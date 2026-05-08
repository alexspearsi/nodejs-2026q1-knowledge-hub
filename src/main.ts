import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';
import { CustomLogger } from './common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(CustomLogger);
  app.useLogger(logger);

  process.on('uncaughtException', async (error: Error) => {
    logger.error(error.message, error.stack, 'uncaughtException');

    await app.close();

    process.exit(1);
  });

  process.on('unhandledRejection', async (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;

    logger.error(message, stack, 'unhandledRejection');

    await app.close();

    process.exit(1);
  });

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const port = app.get(ConfigService).getOrThrow('PORT');
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}

bootstrap();

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Knowledge Hub')
    .setDescription(
      'Knowledge hub service for managing articles, categories, and comments',
    )
    .setVersion('1.0.0')
    .setContact(
      'Alexander Strelchenko',
      'https://github.com/alexspearsi',
      'strelchanka06@gmail.com',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [
      ArticleModule,
      CategoryModule,
      CommentModule,
      UserModule,
      AuthModule,
      AiModule,
    ],
  });

  SwaggerModule.setup('/doc', app, document, {
    jsonDocumentUrl: '/doc.json',
    yamlDocumentUrl: '/doc.yaml',
    customSiteTitle: 'Knowledge Hub API',
    swaggerOptions: {
      docExpansion: 'none',
    },
  });
}

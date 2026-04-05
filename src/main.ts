import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ArticleModule } from './article/article.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

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
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [ArticleModule, CategoryModule, CommentModule, UserModule],
  });

  SwaggerModule.setup('/doc', app, document, {
    jsonDocumentUrl: '/doc.json',
    yamlDocumentUrl: '/doc.yaml',
    customSiteTitle: 'Knowledge Hub API',
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

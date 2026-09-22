import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateArticleDto } from '../../article/dto/create-article.dto';
import { UpdateArticleDto } from '../../article/dto/update-article.dto';

export function ApiGetArticles() {
  return applyDecorators(
    ApiOperation({ summary: 'Get list of articles' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of articles returned successfully',
      content: {
        'application/json': {
          example: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              title: 'NestJS Guide',
              content: 'Full guide...',
              status: 'published',
              createdAt: '2026-04-02T12:00:00Z',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing or invalid Bearer token',
    }),
  );
}

export function ApiGetArticleById() {
  return applyDecorators(
    ApiOperation({ summary: 'Get article by id' }),
    ApiParam({ name: 'id', description: 'Article UUID v4' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article found',
      content: {
        'application/json': {
          example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            title: 'NestJS Guide',
            content: 'Full guide...',
            status: 'published',
            createdAt: '2026-04-02T12:00:00Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID format',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
  );
}

export function ApiCreateArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new article' }),
    ApiBody({
      type: CreateArticleDto,
      examples: {
        jwt: {
          summary: 'JWT Authentication article',
          value: {
            title: 'JWT Authentication in NestJS',
            content:
              'JSON Web Tokens (JWT) are a compact and self-contained way to securely transmit information between parties as a JSON object. In NestJS, JWT authentication is implemented using the @nestjs/jwt and @nestjs/passport packages.\n\nTo set up JWT authentication, first install the required packages: npm install @nestjs/jwt @nestjs/passport passport passport-jwt. Then create an AuthModule that imports JwtModule.register() with your secret key and expiration time.\n\nThe authentication flow works as follows: the user sends credentials (email and password) to the login endpoint. The AuthService validates the credentials against the database. If valid, it generates a JWT token using JwtService.sign() with the user payload. The client stores this token and sends it in the Authorization header as "Bearer <token>" for subsequent requests.\n\nTo protect routes, use the JwtAuthGuard which extends AuthGuard("jwt"). Apply it with @UseGuards(JwtAuthGuard) on controllers or individual endpoints. The JwtStrategy validates the token on each request and attaches the decoded user to the request object.\n\nRefresh tokens are used to obtain new access tokens without re-authenticating. Store refresh tokens securely in the database and invalidate them on logout.',
            status: 'published',
            tags: ['jwt', 'authentication', 'security', 'nestjs'],
          },
        },
        docker: {
          summary: 'Docker and Docker Compose article',
          value: {
            title: 'Docker and Docker Compose for Node.js Applications',
            content:
              'Docker is a platform for developing, shipping, and running applications in containers. Containers package your application with all its dependencies, ensuring consistent behavior across different environments.\n\nA Dockerfile defines how to build your application image. For a Node.js application, start with a base image: FROM node:20-alpine. Set the working directory with WORKDIR /app. Copy package files and run npm ci for reproducible installs. Then copy your source code and build it. Use multi-stage builds to keep the final image small — the build stage compiles TypeScript, the production stage only contains compiled JavaScript.\n\nDocker Compose orchestrates multiple containers. Define services in docker-compose.yml: your application, a PostgreSQL database, and any other dependencies. Use depends_on with healthcheck conditions to ensure services start in the correct order. The db service should have a healthcheck using pg_isready. The app service should depend on db being healthy.\n\nEnvironment variables are passed via env_file or the environment section. Use named volumes for persistent data like postgres-data. Create a custom network so containers can communicate using service names as hostnames — for example, the app connects to PostgreSQL at host "db" on port 5432.\n\nCommon commands: docker compose up --build to start all services, docker compose down to stop them, docker compose logs -f to follow logs.',
            status: 'published',
            tags: ['docker', 'devops', 'containers', 'nodejs'],
          },
        },
        prisma: {
          summary: 'Prisma ORM article',
          value: {
            title: 'Database Management with Prisma ORM',
            content:
              'Prisma is a next-generation ORM for Node.js and TypeScript that provides type-safe database access, automated migrations, and an intuitive data model.\n\nThe Prisma schema file (schema.prisma) defines your data models. Each model maps to a database table. Fields have types like String, Int, Boolean, DateTime, and relationships are defined with relation fields. Run npx prisma generate to generate the Prisma Client based on your schema.\n\nMigrations are created with npx prisma migrate dev --name migration-name. This generates SQL migration files and applies them to your development database. For production, use npx prisma migrate deploy which only applies pending migrations without creating new ones.\n\nThe PrismaClient provides methods for all CRUD operations. Use findMany with where clauses for filtering, include for eager loading relations, and select for choosing specific fields. Transactions are supported via prisma.$transaction() for operations that must succeed or fail together.\n\nIn NestJS, create a PrismaService that extends PrismaClient and implements OnModuleInit to connect on startup and OnModuleDestroy to disconnect on shutdown. Register it as a provider in PrismaModule and export it for use in other modules.\n\nPrisma Studio (npx prisma studio) provides a visual database browser at localhost:5555 for inspecting and editing data during development.',
            status: 'published',
            tags: ['prisma', 'database', 'orm', 'postgresql'],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Article created successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
    }),
  );
}

export function ApiUpdateArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Update article by id' }),
    ApiParam({ name: 'id', description: 'Article UUID v4' }),
    ApiBody({
      type: UpdateArticleDto,
      examples: {
        example1: {
          summary: 'Update article title',
          value: {
            title: 'Updated title',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Article updated successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid data or UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
  );
}

export function ApiDeleteArticle() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete article by id' }),
    ApiParam({ name: 'id', description: 'Article UUID v4' }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Article deleted successfully',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid UUID',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Article not found',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Missing or invalid Bearer token',
    }),
  );
}

# Knowledge Hub API

REST API for managing articles, categories, comments, and users. Built with NestJS + PostgreSQL + Prisma.


## Docker Hub

Image: https://hub.docker.com/r/alexspearsi/knowledge-hub


## Quick Start (Docker)

**1. Clone the repository**

```bash
git clone https://github.com/alexspearsi/nodejs-2026q1-knowledge-hub.git
cd nodejs-2026q1-knowledge-hub
```

**2. Create environment file**

```bash
cp .env.example .env
```

**3. Start the application**

```bash
docker-compose up --build
```

Wait until you see:
```
app  | Application is running on: http://localhost:4000
```

**4. Running tests**

After starting the application with `docker-compose up --build`, run the tests in a separate terminal:

```bash
npm run test:auth
npm run test:refresh
npm run test:rbac
```

**Seed the database (optional)**

In a separate terminal, run to populate the database with sample data:

```bash
docker-compose exec app npx prisma db seed
```

**5. Open in browser**

API http://localhost:4000
Swagger docs http://localhost:4000/doc
PostgreSQL `localhost:5433`


## Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop and remove all data (database volume)
docker-compose down -v
```


## Running Without Docker

Requires Node.js and a running PostgreSQL instance.

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment**

```bash
cp .env.example .env
```

Update `POSTGRES_HOST` to `localhost` and make sure PostgreSQL is running.

**3. Apply migrations**

```bash
npx prisma migrate deploy
```

**4. Seed the database**

```bash
npx prisma db seed
```

**5. Start the application**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Common Issues

**Port 4000 is already in use**

Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "4001:4000"   # use 4001 on your machine instead
```
And update `PORT=4001` in `.env`.

**Port 5433 is already in use**

Change the DB port mapping in `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"
```

**App container exits immediately**

Check logs to see what failed:
```bash
docker-compose logs app
```

**Database has no tables after restart**

Migrations run automatically on each container start. If something went wrong:
```bash
docker-compose exec app npx prisma migrate deploy
```

**Tests are failing**

Open Adminer at http://localhost:8081, log in, and manually delete all generated data from the tables, then re-run the tests.

**Want to reset the database completely**

```bash
docker-compose down -v
docker-compose up --build
```

## Gemini AI Integration

### Model

`gemini-2.5-flash` (configurable via `GEMINI_MODEL` in `.env`).

### Getting an API key

1. Go to [https://aistudio.google.com](https://aistudio.google.com) and sign in with your Google account
2. Click **"Get API key"** and **"Create API key"**
3. Copy the generated key and paste it into `GEMINI_API_KEY=` in your `.env`

### AI-specific environment variables

```env
GEMINI_API_KEY=your-api-key-here
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.5-flash
AI_RATE_LIMIT_RPM=20
AI_CACHE_TTL_SEC=300
```

## RAG (Retrieval-Augmented Generation)

### Models

Generation `gemini-2.5-flash` (env: `GEMINI_MODEL`) |
Embeddings `gemini-embedding-2` (env: `GEMINI_EMBEDDING_MODEL`) |

### Vector DB

[Qdrant](https://qdrant.tech/) runs as a Docker container on port **6333**, data persisted to `qdrant-data` volume. The app connects via internal hostname `vectordb` (`RAG_VECTOR_DB_URL=http://vectordb:6333`).

### Startup flow

```bash
# 1. Clone and configure
cp .env.example .env
# set GEMINI_API_KEY and GEMINI_EMBEDDING_MODEL=gemini-embedding-2 in .env

# 2. Start all services (app + PostgreSQL + Qdrant)
docker-compose up --build

# 3. Build the vector index
curl -X POST http://localhost:4000/ai/rag/index \
  -H "Content-Type: application/json" \
  -d '{"onlyPublished": true}'

# 4. Semantic search
curl -X POST http://localhost:4000/ai/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "how to authenticate users", "limit": 3}'

# 5. Chat
curl -X POST http://localhost:4000/ai/rag/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What articles do you have about authentication?"}'
```

### Known limitations

- **Rate limits**: Gemini free tier ~15 req/min for generation, ~1500 req/day for embeddings. Large reindex operations may hit the quota.
- **Indexing latency**: Each chunk = one Gemini API call. 50 articles can take 30–60 seconds to index.
- **Regional availability**: Gemini API may not be available in all regions — check your Google Cloud project settings if you get 403.
- **Conversation history**: Stored in application memory, cleared on container restart.
- **Vector dimension lock**: Collection is created once with fixed size (3072 for `gemini-embedding-2`). Switching models requires dropping and recreating the collection.

## Security Scan

Tool: Docker Scout
Image: nodejs-2026q1-knowledge-hub-app:latest

Results:
  - CRITICAL: 0
  - HIGH: 2
  - MEDIUM: 5
  - LOW: 12

No critical vulnerabilities found. High severity issues are in
transitive dependencies of node:24-alpine base image and do not
affect application functionality.

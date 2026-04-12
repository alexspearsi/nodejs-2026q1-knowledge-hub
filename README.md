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

**4. Open in browser**

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

**4. Start the application**

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

**Want to reset the database completely**

```bash
docker-compose down -v
docker-compose up --build
```

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

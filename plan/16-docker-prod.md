# Step 16 — Production Docker & Nginx

## Goal

Create production-ready Dockerfiles for all apps, a full `docker-compose.prod.yml`, and an
nginx reverse proxy configuration that routes subdomains to the correct containers.

## Architecture

```
                   ┌───────────────────────────────┐
                   │          Nginx Proxy           │
                   │     (ports 80, 443 / SSL)      │
                   └───────────┬───────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                     │
    ┌─────▼─────┐    ┌────────▼────────┐    ┌──────▼──────┐
    │iscoded.com│    │app.iscoded.com  │    │api.iscoded  │
    │ (website) │    │ (user app)      │    │  .com       │
    │ :3004     │    │ :3000           │    │ (backend)   │
    └───────────┘    └─────────────────┘    │ :3001       │
                                            └─────────────┘
    ┌───────────────────┐    ┌──────────────────────┐
    │portfolio.iscoded  │    │dashboard.iscoded     │
    │  .com             │    │  .com                │
    │ (portfolio)       │    │ (dashboard)          │
    │ :3002             │    │ :3003                │
    └───────────────────┘    └──────────────────────┘
                                      │
                               ┌──────▼──────┐
                               │ PostgreSQL   │
                               │ :5432        │
                               └─────────────┘
```

## Steps

### 16.1 — Dockerfile for Elysia backend

**docker/Dockerfile.backend:**

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/
COPY packages/auth/package.json ./packages/auth/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN cd packages/db && bunx prisma generate
RUN cd apps/backend && bun run build

FROM base AS production
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/packages/db/generated ./packages/db/generated
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
```

### 16.2 — Dockerfile for Next.js apps

**docker/Dockerfile.next:**

A multi-stage Dockerfile parameterized by `APP_NAME`:

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare bun@latest --activate
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
COPY apps/${APP_NAME}/package.json ./apps/${APP_NAME}/
COPY packages/ui/package.json ./packages/ui/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tailwind-config/package.json ./packages/tailwind-config/
RUN bun install --frozen-lockfile

FROM base AS build
ARG APP_NAME
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN cd packages/db && bunx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/${APP_NAME} && bun run build

FROM base AS production
ARG APP_NAME
COPY --from=build /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=build /app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=build /app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public
EXPOSE 3000
CMD ["node", "apps/${APP_NAME}/server.js"]
```

Each Next.js app needs `output: "standalone"` in its `next.config.ts` for production Docker:

```ts
const config: NextConfig = {
  output: "standalone",
  // ... rest of config
};
```

Exception: `apps/website` uses `output: "export"` (static site), so it gets served directly
by nginx from its `out/` directory instead of running a Node process.

### 16.3 — Production docker-compose

**docker/docker-compose.prod.yml:**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    env_file:
      - ../.env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile.next
      args:
        APP_NAME: app
    restart: unless-stopped
    depends_on:
      - backend
    env_file:
      - ../.env
    environment:
      API_URL: http://backend:3001

  portfolio:
    build:
      context: ..
      dockerfile: docker/Dockerfile.next
      args:
        APP_NAME: portfolio
    restart: unless-stopped
    depends_on:
      - backend
    env_file:
      - ../.env
    environment:
      API_URL: http://backend:3001

  dashboard:
    build:
      context: ..
      dockerfile: docker/Dockerfile.next
      args:
        APP_NAME: dashboard
    restart: unless-stopped
    depends_on:
      - backend
    env_file:
      - ../.env
    environment:
      API_URL: http://backend:3001

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ../apps/website/out:/var/www/website:ro
    depends_on:
      - backend
      - app
      - portfolio
      - dashboard

volumes:
  pgdata:
```

### 16.4 — Nginx configuration

**docker/nginx/nginx.conf:**

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream backend {
        server backend:3001;
    }

    upstream app {
        server app:3000;
    }

    upstream portfolio {
        server portfolio:3000;
    }

    upstream dashboard {
        server dashboard:3000;
    }

    # iscoded.com — static website
    server {
        listen 80;
        server_name iscoded.com www.iscoded.com;

        root /var/www/website;
        index index.html;

        location / {
            try_files $uri $uri.html $uri/ =404;
        }
    }

    # api.iscoded.com — Elysia backend
    server {
        listen 80;
        server_name api.iscoded.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # app.iscoded.com — user portal
    server {
        listen 80;
        server_name app.iscoded.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # portfolio.iscoded.com — portfolio renderer
    server {
        listen 80;
        server_name portfolio.iscoded.com;

        location / {
            proxy_pass http://portfolio;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # dashboard.iscoded.com — admin dashboard
    server {
        listen 80;
        server_name dashboard.iscoded.com;

        location / {
            proxy_pass http://dashboard;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 16.5 — SSL/TLS

For production, add SSL via Certbot/Let's Encrypt. Two options:

**Option A: Certbot in Docker**
Add a certbot service to docker-compose and configure nginx for HTTPS.

**Option B: External reverse proxy**
Use Caddy, Traefik, or a cloud load balancer in front that handles TLS termination.

### 16.6 — Production .env

Create `.env.production` with real values:
```env
POSTGRES_DB=devport
POSTGRES_USER=devport
POSTGRES_PASSWORD=<strong-password>
DATABASE_URL=postgresql://devport:<strong-password>@postgres:5432/devport

BETTER_AUTH_SECRET=<32-char-random-string>
BETTER_AUTH_URL=https://api.iscoded.com

GOOGLE_CLIENT_ID=<real-client-id>
GOOGLE_CLIENT_SECRET=<real-secret>
GITHUB_CLIENT_ID=<real-client-id>
GITHUB_CLIENT_SECRET=<real-secret>

AWS_ACCESS_KEY_ID=<real-key>
AWS_SECRET_ACCESS_KEY=<real-secret>
AWS_S3_BUCKET=devport-uploads
AWS_REGION=us-east-1

NEXT_PUBLIC_API_URL=https://api.iscoded.com
NEXT_PUBLIC_APP_URL=https://app.iscoded.com
NEXT_PUBLIC_PORTFOLIO_URL=https://portfolio.iscoded.com
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.iscoded.com
```

### 16.7 — Deploy commands

```bash
# On VPS
git clone <repo-url> devport
cd devport
cp .env.example .env
# Edit .env with production values

# Build and start
docker compose -f docker/docker-compose.prod.yml build
docker compose -f docker/docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker/docker-compose.prod.yml exec backend bunx prisma migrate deploy

# Seed admin user
docker compose -f docker/docker-compose.prod.yml exec backend bun run db:seed
```

## Key Notes

- Internal container communication uses Docker DNS (e.g., `http://backend:3001`).
  `NEXT_PUBLIC_*` URLs are the public-facing URLs that browsers use.
- `API_URL` (server-only) in Next.js apps points to `http://backend:3001` inside Docker.
- The website is served as static files by nginx — no running Node process needed.
- PostgreSQL data persists via the `pgdata` Docker volume.
- For zero-downtime deploys, consider using `docker compose up -d --build --remove-orphans`.

## Verification

- `docker compose -f docker/docker-compose.prod.yml up -d` starts all services
- `curl http://localhost` returns the website
- `curl http://localhost:3001/api/auth/ok` returns `{ "ok": true }`
- All subdomains route correctly via nginx
- Database persists across container restarts

## Next Step

Proceed to [Step 17 — Contribution Docs & Final Checks](./17-contribution-docs.md).

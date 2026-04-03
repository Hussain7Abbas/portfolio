# Docker production examples

| File | Purpose |
|------|---------|
| `Dockerfile.backend` | Elysia API (`bun dist/index.js`). Build from repo root: `docker build -f docker/Dockerfile.backend -t devport-backend ..` |
| `Dockerfile.next` | Next.js `standalone` output. Pass `APP_NAME` (`app`, `portfolio`, `dashboard`) and optional `BACKEND_URL` for API rewrites at build time. |
| `Dockerfile.website` | Static export (`next build` with `output: "export"`) served by nginx. |
| `docker-compose.prod.yml` | Postgres, backend, all Next apps, static website, and an nginx reverse proxy. |
| `nginx/nginx.conf` | Example hostnames (`iscoded.com`, `app.iscoded.com`, …) — edit for your domains. |

`apps/website` builds static files to `out/` (gitignored). The website image copies that folder into nginx.

Next.js `standalone` servers listen on port 3000 inside each app container. Set `NEXT_PUBLIC_*` and `BETTER_AUTH_*` via `.env` used at **build** time where those values are inlined into the client bundle.

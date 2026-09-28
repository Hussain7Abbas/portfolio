# Deployment

[← Docs index](intro.md)

DevPort targets self-hosting on a VPS with Docker. The files live in [`docker/`](../docker/README.md). That README lists each file, and this page summarises how the files fit together.

## Images

- **`Dockerfile.backend`** bundles `apps/backend` with `bun build` and runs `bun dist/index.js` on port 3001.
- **`Dockerfile.next`** is a generic Next.js `standalone` image. The `APP_NAME` build arg selects `app`, `portfolio`, or `dashboard`, and `BACKEND_URL` sets the `/api` rewrite target at build time. The Prisma client is generated during the build, and the container listens on 3000.
- **`Dockerfile.website`** builds the static export (`apps/website/out/`) and serves it with nginx.

## Compose stack

`docker/docker-compose.prod.yml` runs Postgres 16, the backend, the three Next apps, the static website, and an nginx reverse proxy (`docker/nginx/nginx.conf`, which routes example `*.iscoded.com` hostnames; edit these for your domains). Each service reads its own `apps/<name>/.env`, and `docker/.env` holds the `POSTGRES_*` credentials.

## Build-time values

Next.js inlines `NEXT_PUBLIC_*` values (and the rewrite target) into the build output. Supply the production values when you **build** each image, not only when you run it. The Next images copy `apps/`, so `apps/<name>/.env` is present during `next build`.

## External services

- **Email:** set `RESEND_API_KEY` and `EMAIL_FROM` (a sender on a domain verified in Resend) in `apps/backend/.env` so verification codes are emailed instead of logged.
- **Uploads:** create a Hetzner Object Storage bucket, set its visibility to public, generate S3 credentials, and set `HETZNER_S3_ACCESS_KEY`, `HETZNER_S3_SECRET_KEY`, `HETZNER_S3_BUCKET`, and `HETZNER_S3_LOCATION` (`fsn1`, `nbg1`, or `hel1`) in `apps/backend/.env`. The bucket also needs a CORS rule allowing `PUT` from the user app origin, because browsers upload directly with the presigned URL.

## Not yet covered

The project does not yet include TLS termination, CI image builds, or database migrations. Schema changes are applied with `prisma db push`. See the follow-ups in [`plan/IMPLEMENTATION-STATUS.md`](../plan/IMPLEMENTATION-STATUS.md).

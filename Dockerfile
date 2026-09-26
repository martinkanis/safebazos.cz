# ──────────────────────────────────────────────
# SafeBazos — Next.js standalone.
#
# Konfigurace (DATABASE_URL, AUTH_SECRET, S3_*, SMTP_*, ADMIN_*) se čte až za
# běhu z prostředí — image je stejná pro všechna prostředí. Hodnoty v build
# stage jsou jen placeholdery pro validaci env při `next build`.
# Migrace, kategorie a admin účet se aplikují při startu (src/instrumentation.ts).
# ──────────────────────────────────────────────
FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL=postgres://build:build@localhost:5432/build \
    AUTH_SECRET=build-only-placeholder-secret \
    pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static .next/static
COPY --from=builder --chown=node:node /app/src/db/migrations src/db/migrations
USER node
EXPOSE 3000
CMD ["node", "server.js"]

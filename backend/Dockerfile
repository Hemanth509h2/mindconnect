# =============================================================================
# mindconnect backend - Docker image
# =============================================================================
#
# What this is:
#   API-only Next.js app (routes under src/app/api). Listens on port 4200.
#
# How to build (run inside the backend/ folder):
#   docker build -t mindconnect-backend .
#
# How to run:
#   docker run -p 4200:4200 --env-file .env mindconnect-backend
#
# Required env at runtime:
#   DATABASE_URL   Neon Postgres connection string
#   AUTH_SECRET    JWT secret (openssl rand -base64 32)
#   ALLOWED_ORIGINS comma-separated CORS origins
#
# The image keeps the Prisma schema so `prisma generate` output is bundled.
# Migrate the database on your own machine or in a release job:
#   docker run --rm --env-file .env mindconnect-backend npx prisma db push
# =============================================================================


# -----------------------------------------------------------------------------
# Stage 1: install deps and build
# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Prisma engine needs OpenSSL + CA certs for TLS to Neon.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better layer caching.
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy the Prisma schema and generate the client.
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source and compile.
COPY . .
RUN npm run build


# -----------------------------------------------------------------------------
# Stage 2: runner
# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Only production dependencies are needed to run.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

# Do not run as root.
USER node

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4200/api/health').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node_modules/.bin/next", "start", "-p", "4200"]

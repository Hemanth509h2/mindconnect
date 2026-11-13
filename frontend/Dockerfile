# =============================================================================
# mindconnect frontend - Docker image
# =============================================================================
#
# What this is:
#   Next.js website. Listens on port 3200.
#
# How to build (run inside the frontend/ folder):
#   docker build -t mindconnect-frontend .
#
# How to run:
#   docker run -p 3200:3200 --env-file .env mindconnect-frontend
#
# Required env at runtime:
#   API_URL   backend API base URL, e.g. http://localhost:4200
#
# The build copies .env if present, but secrets should be passed at runtime
# rather than baked into the image.
# =============================================================================


# -----------------------------------------------------------------------------
# Stage 1: install deps and build
# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependency files first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and compile.
COPY . .
RUN npm run build


# -----------------------------------------------------------------------------
# Stage 2: runner
# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3200
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

USER node

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3200/').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"

CMD ["node_modules/.bin/next", "start", "-p", "3200"]

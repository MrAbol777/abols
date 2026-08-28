# -----------------------------------------------------------------------------
# Base Image: Debian Bookworm slim with Node 20 LTS and OpenSSL
# -----------------------------------------------------------------------------
FROM node:20-slim AS base
WORKDIR /app

# -----------------------------------------------------------------------------
# Dependencies Stage: Install npm dependencies
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# -----------------------------------------------------------------------------
# Builder Stage: Generate Prisma Client & Build Next.js
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time defaults so static route generation succeeds
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./dev.db"
ENV AUTH_SECRET="build-secret-placeholder-minimum-32-characters"

# Generate Prisma client and build standalone bundle
RUN npx prisma generate
RUN npm run build

# -----------------------------------------------------------------------------
# Production Runner Stage: Optimized container for Hamravesh Darkube
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package metadata
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copy public static files
COPY --from=builder /app/public ./public

# Copy Next.js standalone server and static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

# Setup data and uploads directory for persistent storage
RUN mkdir -p /app/data /app/public/uploads/receipts

# Setup startup entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Darkube default HTTP port
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]

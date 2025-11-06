# Multi-stage Dockerfile for Next.js production build
# 1) Install dependencies with caching
# 2) Build app to standalone output
# 3) Run minimal production image as non-root

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies only (uses npm because package-lock.json is present)
FROM base AS deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Build the application
FROM base AS builder
# Copy application source
COPY . .
# Reuse deps from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Build Next.js (standalone output enabled via next.config)
RUN npm run build

# Production runtime image
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone build output and static assets
# .next/standalone contains server.js and minimal node_modules
COPY --from=builder /app/.next/standalone ./
# .next/static is required for assets
COPY --from=builder /app/.next/static ./.next/static
# public assets
COPY --from=builder /app/public ./public

# Ensure proper ownership
RUN chown -R nextjs:nextjs /app
USER nextjs

EXPOSE 3000
# Optional simple healthcheck (requires wget in node:alpine; comment out if not desired)
# RUN apk add --no-cache wget
# HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/ || exit 1

# Start the Next.js server from the standalone output
CMD ["node", "server.js"]

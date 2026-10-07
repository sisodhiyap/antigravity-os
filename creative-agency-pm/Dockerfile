# Multi-Stage Dockerfile for Aura Studio Creative Agency PM SaaS
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json tsconfig.json ./
RUN npm install

# Copy source code and build
COPY src/ ./src/
RUN npx tsc

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3400
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm install --production

# Copy compiled JavaScript and static public assets
COPY --from=builder /app/dist ./dist
COPY src/public ./dist/public
COPY src/db/schema.sql ./dist/db/schema.sql

# Create persistent data volume
RUN mkdir -p /app/data /app/data/vault

EXPOSE 3400

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3400/api/health || exit 1

CMD ["node", "dist/server.js"]

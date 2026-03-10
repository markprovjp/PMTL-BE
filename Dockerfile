# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Strapi
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Install production dependencies fresh (avoids issues with pruning build-time deps)
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy build output and runtime files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/database ./database

# Strapi expects runtime config at /app/config (not only /app/dist/config)
# Copy the compiled config so Node doesn't need to execute TypeScript config files.
COPY --from=builder /app/dist/config ./config

# Set non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 1337

# Health check (wait for it to be ready)
HEALTHCHECK --interval=20s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:1337/admin || exit 1

ENTRYPOINT ["dumb-init", "--"]

# 🚀 Strapi 5 Production start command
CMD ["npm", "start"]

# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build Strapi with enough headroom for the admin build on 4GB VPS hosts.
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN npm run build && \
    npm prune --omit=dev && \
    npm cache clean --force

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy build output and runtime files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/database ./database
COPY --from=builder /app/.strapi ./.strapi

# Strapi expects runtime config at /app/config (not only /app/dist/config)
# Copy the compiled config so Node doesn't need to execute TypeScript config files.
COPY --from=builder /app/dist/config ./config

# Strapi start detects TypeScript projects via tsconfig.json.
# Keep the built admin SPA available in both possible runtime lookup paths.
RUN mkdir -p /app/dist/build /app/build && \
    cp -R /app/.strapi/client/. /app/dist/build/ && \
    cp -R /app/.strapi/client/. /app/build/

# Set non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 1337

# Health check (wait for Strapi + admin bundle to be ready)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost:1337/admin || exit 1

ENTRYPOINT ["dumb-init", "--"]

# 🚀 Strapi 5 Production start command
CMD ["npm", "start"]

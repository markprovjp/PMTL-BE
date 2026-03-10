# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Strapi
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build && \
    npm prune --production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy binary and production files only
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

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

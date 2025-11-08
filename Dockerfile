# Multi-stage build for Next.js frontend
FROM node:24-alpine AS builder

WORKDIR /app

# Build arguments for Next.js public environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_JWT_SECRET
ARG NEXT_PUBLIC_AWS_S3_BUCKET_NAME
ARG NEXT_PUBLIC_LIFF_ID
ARG NEXT_PUBLIC_API_URL

# Set environment variables for build
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_JWT_SECRET=$NEXT_PUBLIC_JWT_SECRET
ENV NEXT_PUBLIC_AWS_S3_BUCKET_NAME=$NEXT_PUBLIC_AWS_S3_BUCKET_NAME
ENV NEXT_PUBLIC_LIFF_ID=$NEXT_PUBLIC_LIFF_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:24-alpine AS runner

# Install dumb-init and wget for proper signal handling and health checks
RUN apk add --no-cache dumb-init wget && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create necessary directories with proper ownership
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app

# Copy built application and necessary files
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port (configurable via PORT env var, defaults to 3000)
EXPOSE 3000

# Health check for Next.js application
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the Next.js application
CMD ["node", "server.js"]

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy workspace manifests
COPY package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/index.js ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Install all workspace deps
RUN npm install --workspace=apps/web --workspace=packages/shared --ignore-scripts

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Build args become env vars at build time
ARG MONGODB_URI
ARG TMDB_API_KEY
ARG NEXTAUTH_SECRET
ARG NEXT_PUBLIC_APP_URL=https://rusilstream.app
ARG RESEND_API_KEY
ARG RESEND_FROM_EMAIL

ENV MONGODB_URI=$MONGODB_URI
ENV TMDB_API_KEY=$TMDB_API_KEY
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV RESEND_FROM_EMAIL=$RESEND_FROM_EMAIL
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/web
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Runtime env vars — passed via docker run -e or docker-compose
ENV MONGODB_URI=""
ENV TMDB_API_KEY=""
ENV NEXTAUTH_SECRET=""
ENV NEXT_PUBLIC_APP_URL="https://rusilstream.app"
ENV RESEND_API_KEY=""
ENV RESEND_FROM_EMAIL=""

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

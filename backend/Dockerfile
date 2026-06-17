# ============================================
# Backend Dockerfile - Multi-stage pnpm build
# ============================================

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build shared package
# ============================================
FROM base AS build-shared

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared ./packages/shared

RUN pnpm --filter @guesthouse/shared build

# ============================================
# Stage 3: Build backend
# ============================================
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY backend ./backend

WORKDIR /app/backend
RUN pnpm build

# ============================================
# Stage 4: Production runtime
# ============================================
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build-shared /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/backend/dist ./backend/dist

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

USER expressjs

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "dist/server.js"]

FROM oven/bun:1-alpine AS builder
WORKDIR /app

ARG PUBLIC_ORIGIN
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_TWITCH_CLIENT_ID
ARG PUBLIC_TWITCH_AUTH_CALLBACK

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate
RUN printenv
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun build/index.js"]
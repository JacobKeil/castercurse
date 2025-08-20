# Stage 1: Build the SvelteKit app using the official Bun image
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen

ARG PUBLIC_ORIGIN
ARG DATABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_TWITCH_CLIENT_ID
ARG SECRET_TWITCH_SECRET
ARG PUBLIC_TWITCH_AUTH_CALLBACK

# Copy the rest of the application source code
COPY . .

# Generate prisma client and build the app
RUN bunx prisma generate
RUN bun run build


# Stage 2: Create the production image
FROM oven/bun:1-alpine
WORKDIR /app

# Copy built assets and production dependencies from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Expose the port the SvelteKit app runs on
EXPOSE 3000

# Run migrations and then start the app
# Note: We use 'node build/index.js' for the most reliable startup
CMD ["sh", "-c", "bunx prisma migrate deploy && node build/index.js"]
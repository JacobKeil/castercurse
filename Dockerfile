# Dockerfile

#################################################################
# STAGE 1: BUILDER
# Use a full Bun image to install all dependencies and build the app.
#################################################################
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# SvelteKit needs PUBLIC_ variables at build time.
# These can be passed using --build-arg in a CI/CD pipeline.
ARG PUBLIC_ORIGIN
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_TWITCH_CLIENT_ID
ARG PUBLIC_TWITCH_AUTH_CALLBACK

# Copy package files and install ALL dependencies (including dev)
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client and build the SvelteKit application
RUN bunx prisma generate
RUN printenv
RUN bun run build


#################################################################
# STAGE 2: RUNNER
# Create a lean final image with only the built app and prod dependencies.
#################################################################
FROM oven/bun:1-alpine
WORKDIR /app

# Copy package files and install ONLY production dependencies.
# This dramatically reduces the final image size.
COPY package.json bun.lockb ./
RUN bun install --production

# Copy the built application and the prisma schema from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose the port the SvelteKit app runs on
EXPOSE 3000

# This command first runs any pending database migrations
# and then starts the production server.
# Secret variables (like DATABASE_URL) are loaded from your .env file at runtime.
CMD ["sh", "-c", "bunx prisma migrate deploy && bun build/index.js"]
# Stage 1 (Builder) -> Shared foundation 
FROM node:20-alpine AS deps

# Set WORKDIR
WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json ./
RUN npm ci

#---- Build the Next.js app------
FROM node:20-alpine AS builder
WORKDIR /app
RUN mkdir -p public

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ls -d public/ && npm run build

# ── Stage 3: production runner ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app


RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN mkdir -p /app/public && chown -R appuser:appgroup /app/public

RUN npm install dotenv pg
RUN touch .env.local && chown appuser:appgroup .env.local


# Copy only what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

# creating database schema in run time
COPY sql ./sql
COPY scripts ./scripts


USER appuser
EXPOSE 3000
CMD ["node", "server.js"]   
# Next.js standalone output entry point



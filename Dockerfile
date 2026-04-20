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
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: production runner ────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts

USER appuser
EXPOSE 3000
CMD ["node", "server.js"]   
# Next.js standalone output entry point



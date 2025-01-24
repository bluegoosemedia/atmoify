# Use Node.js 20 (LTS version)
FROM node:20-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Print Node.js and npm versions for debugging
RUN node --version && npm --version

# Install dependencies with verbose logging
RUN npm install --verbose --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js app
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]


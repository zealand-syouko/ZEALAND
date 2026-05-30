FROM node:20-bullseye-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cp prisma/schema.pg.prisma prisma/schema.prisma
ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV PATH=/app/node_modules/.bin:$PATH
RUN prisma generate
RUN next build

FROM base AS runner
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000 8080
CMD ["sh", "-c", "export PORT=3000; npx prisma migrate deploy 2>/dev/null || npx prisma migrate dev --name init --skip-generate; npx prisma db seed 2>/dev/null; node server.js"]

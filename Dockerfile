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
ENV NODE_ENV=production
ENV PATH=/app/node_modules/.bin:$PATH
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules
COPY deploy/startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

EXPOSE 3000 8080
CMD ["/app/startup.sh"]

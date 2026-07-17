FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY drizzle.config.json ./
COPY src/ ./src/
COPY drizzle/ ./drizzle/
RUN npm run build

FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS prod

WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs && apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm install --omit=dev && chown -R nodejs:nodejs /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY drizzle.config.json ./
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY scripts/migrate-and-seed.sh /migrate-and-seed.sh

RUN chown -R nodejs:nodejs /app && chmod +x /docker-entrypoint.sh /migrate-and-seed.sh

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3001/api/health',r=>{process.exit(r.statusCode===200?0:1)})"

ENTRYPOINT ["/docker-entrypoint.sh"]

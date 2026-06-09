FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY drizzle/ ./drizzle/
RUN npm run build

FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3001/api/health',r=>{process.exit(r.statusCode===200?0:1)})"

CMD ["sh", "-c", "timeout 40 node dist/db/migrate.js; timeout 40 node dist/db/seed.js; node dist/index.js"]

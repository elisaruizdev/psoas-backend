# Etapa 1: compila la API de NestJS
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# Etapa 2: solo lo necesario para ejecutarla
FROM node:22-alpine
WORKDIR /app
# Sin NODE_ENV=production: app.module activa SSL con él y el Postgres local no lo usa

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main"]

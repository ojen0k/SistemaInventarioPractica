# 1. Base: Imagen ligera de Node.js que usaremos como punto de partida
FROM node:20-alpine AS base
WORKDIR /app

# 2. Deps: Instalamos las dependencias
# Se hace en una etapa separada para aprovechar la caché de Docker
FROM base AS deps
RUN npm install -g pnpm && npm cache clean --force
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile && pnpm store prune

# 3. Build: Construimos la aplicación
# Copiamos los node_modules de la etapa anterior y el código fuente
FROM base AS build
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .
# Aceptamos la URL de la API como argumento de construcción
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Se ejecuta el build de Next.js (genera la carpeta .next)
RUN pnpm run build

# 4. Producción: Imagen final limpia y optimizada
# Solo copiamos lo necesario para correr la app, sin código fuente ni dependencias de desarrollo
FROM node:20-alpine AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN apk update && apk add --no-cache ghostscript \
    && rm -rf /var/cache/apk/*

COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Copiamos la versión "standalone" (autocontenida) que genera Next.js
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
# El puerto interno de Next.js siempre es 3000 por defecto
EXPOSE 3000

CMD ["node", "server.js"]
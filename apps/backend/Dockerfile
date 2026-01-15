FROM node:20-alpine AS base
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Instalamos todas las dependencias (mssql, passport, jwt, etc.)
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Generamos el cliente de Prisma (necesario para conectar a SQL Server)
RUN pnpm exec prisma generate

# Compilamos la aplicación NestJS
RUN pnpm run build

FROM base AS production
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY package.json pnpm-lock.yaml ./
# Instalamos solo dependencias de producción para aligerar la imagen
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Exponemos el puerto del backend
EXPOSE 3001

CMD ["node", "dist/main"]

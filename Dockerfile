# Primera etapa: construcción
FROM node:20-bullseye AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Segunda etapa: producción
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias y el código construido desde la etapa builder
COPY --from=0 /app/package*.json ./
COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/dist ./dist

# Usar un usuario no root por seguridad
RUN chown -R node:node /app
USER node

# Comando por defecto
CMD ["node", "dist/main"]
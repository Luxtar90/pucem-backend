FROM node:20-bullseye

WORKDIR /app

# Copiar archivos de configuración primero para aprovechar la caché de Docker
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias incluyendo las de desarrollo (necesarias para el build)
RUN npm ci

# Copiar el resto de la aplicación
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar dependencias y el código construido
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Usar un usuario no root por seguridad
RUN chown -R node:node /app
USER node

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]

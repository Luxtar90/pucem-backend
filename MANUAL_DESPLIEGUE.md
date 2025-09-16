# Manual de Despliegue - Backend PUCE Manta

## Tabla de Contenidos
- [Requisitos Previos](#requisitos-previos)
- [1. Configuración Inicial](#1-configuración-inicial)
  - [Clonar el Repositorio](#clonar-el-repositorio)
  - [Instalar Dependencias](#instalar-dependencias)
- [2. Configuración de Variables de Entorno](#2-configuración-de-variables-de-entorno)
- [3. Base de Datos](#3-base-de-datos)
  - [Instalación de PostgreSQL](#instalación-de-postgresql)
  - [Migraciones](#migraciones-si-usas-typeorm)
- [4. Despliegue Local](#4-despliegue-local)
  - [Modo Desarrollo](#modo-desarrollo)
  - [Modo Producción](#modo-producción)
- [5. Despliegue con Docker](#5-despliegue-con-docker)
  - [Construir la Imagen](#construir-la-imagen)
  - [Ejecutar el Contenedor](#ejecutar-el-contenedor)
- [6. Configuración de Red](#6-configuración-de-red)
- [7. Documentación de la API](#7-documentación-de-la-api)
- [8. Monitoreo y Mantenimiento](#8-monitoreo-y-mantenimiento)
  - [Logs](#logs)
  - [Actualizaciones](#actualizaciones)
- [9. Resolución de Problemas Comunes](#9-resolución-de-problemas-comunes)
- [10. Seguridad](#10-seguridad)
- [11. Escalabilidad](#11-escalabilidad)

## Requisitos Previos

- Node.js (versión 20 o superior)
- npm (incluido con Node.js)
- Docker (opcional, para despliegue en contenedores)
- PostgreSQL (base de datos)
- Git

## 1. Configuración Inicial

### Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd pucem-backend
```

### Instalar Dependencias

```bash
npm ci
```

## 2. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Puerto de la aplicación
PORT=3000

# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=pucem_db

# JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=1d

# Configuraciones de CORS
CORS_ORIGIN=http://localhost:3001
```

## 3. Base de Datos

### Instalación de PostgreSQL

1. Instalar PostgreSQL en tu sistema
2. Crear una base de datos vacía
3. Configurar las credenciales en el archivo `.env`

### Migraciones (si usas TypeORM)

```bash
# Ejecutar migraciones
npm run typeorm migration:run
```

## 4. Despliegue Local

### Modo Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en: `http://localhost:3000`

### Modo Producción

```bash
# Construir la aplicación
npm run build

# Iniciar en producción
npm run start:prod
```

## 5. Despliegue con Docker

### Construir la imagen

```bash
docker build -t pucem-backend .
```

### Ejecutar el contenedor

```bash
docker run -d \
  --name pucem-backend \
  -p 3000:3000 \
  --env-file .env \
  pucem-backend
```

## 6. Configuración de Red

Asegúrate de que los siguientes puertos estén abiertos en tu firewall:
- Puerto 3000 (o el puerto que hayas configurado)
- Puerto 5432 (PostgreSQL)

## 7. Documentación de la API

La documentación de la API estará disponible en:
- Swagger UI: `http://localhost:3000/api`
- Esquema JSON: `http://localhost:3000/api-json`

## 8. Monitoreo y Mantenimiento

### Logs

Los logs de la aplicación se pueden ver con:

```bash
# Ver logs del contenedor
docker logs pucem-backend

# Seguir logs en tiempo real
docker logs -f pucem-backend
```

### Actualizaciones

Para actualizar la aplicación:

```bash
# Detener el contenedor
docker stop pucem-backend

# Eliminar el contenedor
docker rm pucem-backend

# Obtener los últimos cambios
git pull origin main

# Reconstruir y ejecutar
docker build -t pucem-backend .
docker run -d --name pucem-backend -p 3000:3000 --env-file .env pucem-backend
```

## 9. Resolución de Problemas Comunes

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté en ejecución
- Comprueba las credenciales en el archivo `.env`
- Asegúrate de que el puerto 5432 esté accesible

### Problemas de permisos
- Si usas Docker, asegúrate de que los volúmenes tengan los permisos correctos
- Verifica que el usuario de la base de datos tenga los permisos necesarios

### Errores de dependencias
- Si hay problemas con las dependencias, intenta:
  ```bash
  rm -rf node_modules package-lock.json
  npm ci
  ```

## 10. Seguridad

- Nunca subas el archivo `.env` al control de versiones
- Usa siempre HTTPS en producción
- Mantén actualizadas las dependencias con `npm audit` y `npm update`
- Configura un firewall adecuado

## 11. Escalabilidad

Para entornos de producción con alta carga, considera:
- Usar un balanceador de carga
- Configurar múltiples instancias de la aplicación
- Usar un sistema de caché como Redis
- Configurar una base de datos con replicación

# 📦 Guía de instalación y ejecución del proyecto

Esta guía explica cómo clonar, configurar y ejecutar el proyecto **Universidad Voto** en un entorno de desarrollo.

---

# 1. Requisitos previos

Antes de comenzar, instala las siguientes herramientas:

* **Node.js** (versión 20 o superior)
* **pnpm** (versión 8 o superior)
* **Git**
* **Docker Desktop** (recomendado para PostgreSQL)

> Si ya tienes PostgreSQL instalado localmente, puedes utilizarlo en lugar de Docker.

Instalar pnpm:

```bash
npm install -g pnpm
```

---

# 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO> universidad-voto
cd universidad-voto
```

Reemplaza `<URL_DEL_REPOSITORIO>` por la URL del repositorio de GitHub.

---

# 3. Configurar las variables de entorno

En la raíz del proyecto crea un archivo llamado:

```text
.env
```

Con el siguiente contenido:

```env
# ======================
# BASE DE DATOS
# ======================

DATABASE_URL="postgresql://admin:admin@localhost:5432/universidad_voto?schema=public"

# ======================
# PUERTOS DE SERVICIOS
# ======================

GATEWAY_PORT=3000
AUTH_PORT=3001
ELECTORAL_PORT=3003
CANDIDATE_PORT=3004
PADRON_PORT=3005
DASHBOARD_PORT=3007
AUDIT_PORT=3008

# ======================
# JWT
# ======================

JWT_SECRET="supersecretjwtkey_change_me_production"
JWT_REFRESH_SECRET="supersecretrefreshkey_change_me_production"
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ======================
# FRONTEND
# ======================

NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"

# ======================
# CORS
# ======================

CORS_ORIGIN="http://localhost:3001,http://localhost:3002"
NODE_ENV=development
```

> **Importante**
>
> Si utilizas otro usuario, contraseña o puerto para PostgreSQL, modifica la variable `DATABASE_URL`.

Ejemplo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/universidad_voto?schema=public"
```

---

# 4. Levantar PostgreSQL

## Opción 1: Docker (Recomendado)

```bash
docker run \
--name postgres-voto \
-e POSTGRES_PASSWORD=admin \
-e POSTGRES_USER=admin \
-e POSTGRES_DB=universidad_voto \
-p 5432:5432 \
-d postgres:15
```

## Opción 2: PostgreSQL local

Solo asegúrate de que:

* PostgreSQL esté ejecutándose.
* Exista una base de datos llamada:

```text
universidad_voto
```

---

# 5. Instalar dependencias

Desde la raíz del proyecto ejecutar:

## Instalar dependencias

```bash
pnpm install
```

## Aprobar paquetes nativos (si pnpm lo solicita)

```bash
pnpm approve-builds
```

Seleccionar los siguientes paquetes:

* bcrypt
* @prisma/client
* prisma
* keccak
* secp256k1

## Generar Prisma Client

```bash
pnpm db:generate
```

## Ejecutar migraciones

```bash
pnpm db:migrate -- --name init
```

---

# 6. Ejecutar los microservicios

Abrir una terminal para cada servicio.

## API Gateway

```bash
pnpm run dev:gateway
```

## Auth Service

```bash
pnpm run dev:auth
```

## Electoral Service

```bash
pnpm --filter electoral-service start:dev
```

## Candidate Service

```bash
pnpm --filter candidate-service start:dev
```

## Padrón Service

```bash
pnpm run dev:padron
```

Si el comando anterior no existe:

```bash
pnpm --filter padron-service start:dev
```

## Dashboard Service

```bash
pnpm --filter dashboard-service start:dev
```

## Audit Service

```bash
pnpm --filter audit-service start:dev
```

---

# 7. Verificar que todos los servicios funcionan

Ejecutar los siguientes comandos.

## Gateway

```bash
curl http://localhost:3000/api/health
```

## Auth

```bash
curl http://localhost:3000/api/auth/health
```

## Electoral

```bash
curl http://localhost:3000/api/elecciones
```

## Candidate

```bash
curl http://localhost:3000/api/candidatos
```

## Padrón

```bash
curl http://localhost:3000/api/padron/estudiantes
```

## Dashboard

```bash
curl http://localhost:3000/api/dashboard/stats
```

## Auditoría

```bash
curl http://localhost:3000/api/audit/events
```

Todos deben responder con un objeto JSON sin errores de conexión.

---

# 8. Importar datos de prueba (Opcional)

Colocar un archivo llamado:

```text
estudiantes.csv
```

en la raíz del proyecto y ejecutar:

```bash
curl.exe -X POST http://localhost:3000/api/padron/importar/ESTUDIANTE \
-F "archivo=@estudiantes.csv" \
-F "habilitar=true"
```

---

# Posibles errores

| Error                                       | Solución                                                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `EPERM: operation not permitted`            | Cerrar VS Code y las terminales, reiniciar el equipo o eliminar `node_modules` y volver a instalar las dependencias.                      |
| `Cannot find module 'bcrypt'`               | Ejecutar `pnpm approve-builds` y aprobar `bcrypt`. Luego ejecutar nuevamente `pnpm install`.                                              |
| `P1001: Can't reach database`               | Verificar que PostgreSQL esté ejecutándose y revisar la variable `DATABASE_URL`.                                                          |
| Puerto `3000` ocupado                       | Cambiar `GATEWAY_PORT` y actualizar `NEXT_PUBLIC_API_URL`.                                                                                |
| `Cannot find module '@nestjs/mapped-types'` | Ejecutar:<br><br>`pnpm add @nestjs/mapped-types --filter electoral-service`<br>`pnpm add @nestjs/mapped-types --filter candidate-service` |

---

# Estructura del proyecto

```text
universidad-voto/
│
├── apps/
│   └── backend/
│       ├── api-gateway/
│       ├── auth-service/
│       ├── electoral-service/
│       ├── candidate-service/
│       ├── padron-service/
│       ├── dashboard-service/
│       └── audit-service/
│
├── packages/
│   └── database/
│       └── prisma/
│           └── schema.prisma
│
├── .env
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

# ✅ Checklist de instalación

* [ ] Instalar Node.js
* [ ] Instalar pnpm
* [ ] Instalar Git
* [ ] Instalar Docker Desktop (opcional si ya existe PostgreSQL)
* [ ] Clonar el repositorio
* [ ] Crear el archivo `.env`
* [ ] Levantar PostgreSQL
* [ ] Ejecutar `pnpm install`
* [ ] Ejecutar `pnpm approve-builds`
* [ ] Ejecutar `pnpm db:generate`
* [ ] Ejecutar `pnpm db:migrate`
* [ ] Levantar los 7 microservicios
* [ ] Verificar los endpoints de salud
* [ ] (Opcional) Importar el archivo `estudiantes.csv`

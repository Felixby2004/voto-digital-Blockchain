# 🐳 Guía de Ejecución con Docker - Universidad Voto

Esta guía explica cómo ejecutar todo el ecosistema de **Universidad Voto** (base de datos, 10 microservicios de backend y 2 aplicaciones de frontend) utilizando **Docker** y **Docker Compose**. 

Al usar Docker, no necesitas instalar Node.js, pnpm, PostgreSQL, ni otras dependencias directamente en tu sistema operativo.

---

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

* **Docker Desktop** (para Windows o macOS) o **Docker Engine** y **Docker Compose** (para Linux).
* **Git** (para clonar y gestionar el repositorio).

---

## 2. Configuración de Variables de Entorno

Docker Compose lee las variables de entorno del archivo `.env` en la raíz del proyecto.

Si no tienes un archivo `.env`, puedes crearlo copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

Asegúrate de que la variable `DATABASE_URL` esté configurada para apuntar al contenedor de base de datos de Docker (el nombre del host debe ser `postgres`, no `localhost`):

```env
DATABASE_URL="postgresql://admin:admin@postgres:5432/universidad_voto?schema=public"
```

*Nota: El archivo `docker-compose.yml` ya está preconfigurado para inyectar esta variable correcta a los microservicios.*

---

## 3. Levantar la Aplicación Completa

Para construir las imágenes del monorepo y levantar todos los contenedores en segundo plano, ejecuta desde la raíz:

```bash
docker-compose up --build -d
```

Este comando:
1. Construirá las imágenes para todos los microservicios usando los Dockerfiles multietapa optimizados.
2. Descargará y configurará la base de datos PostgreSQL.
3. Iniciará todos los servicios en el orden correcto de dependencia.

---

## 4. Inicializar la Base de Datos (Migraciones y Semilla)

Una vez que los contenedores estén activos, debes aplicar las migraciones de Prisma y, opcionalmente, poblar la base de datos con datos de prueba (seed). 

Dado que no tienes herramientas locales, ejecutaremos estos comandos **dentro del contenedor de Docker** que tiene Node y Prisma instalados (por ejemplo, `api-gateway`):

### 4.1 Ejecutar Migraciones de Prisma
```bash
docker-compose exec api-gateway pnpm --filter database db:migrate -- --name init
```

### 4.2 Cargar Datos de Prueba (Seed) - Opcional
```bash
docker-compose exec api-gateway pnpm --filter database db:seed
```

---

## 5. Puertos y Servicios Disponibles

Una vez levantado el entorno, puedes acceder a los siguientes servicios en tu navegador o mediante herramientas como `curl`:

| Servicio | URL / Puerto | Descripción |
| :--- | :--- | :--- |
| **Prisma Studio** | [http://localhost:5555](http://localhost:5555) | Interfaz visual interactiva para la base de datos local |
| **Frontend Web** | [http://localhost:3002](http://localhost:3002) | Interfaz principal para los votantes |
| **Frontend Admin** | [http://localhost:3012](http://localhost:3012) | Panel de administración electoral |
| **API Gateway** | [http://localhost:3000](http://localhost:3000) | Puerta de enlace hacia los microservicios |
| **Auth Service** | Puerto `3001` (interno) | Gestión de autenticación y JWT |
| **Electoral Service** | Puerto `3003` (interno) | Gestión de elecciones |
| **Candidate Service** | Puerto `3004` (interno) | Gestión de candidatos |
| **Padrón Service** | Puerto `3005` (interno) | Padrón de estudiantes |
| **Dashboard Service**| Puerto `3007` (interno) | Estadísticas en tiempo real |
| **Audit Service** | Puerto `3008` (interno) | Registro de eventos y auditoría |
| **Blockchain Service**| Puerto `3009` (interno) | Conexión con Syscoin NEVM |
| **Relayer Service** | Puerto `3010` (interno) | Relayer de transacciones |
| **Crypto Service** | Puerto `3011` (interno) | Operaciones criptográficas y ZKP |

---

## 6. Comandos Útiles de Docker Compose

### Ver los logs en tiempo real
Para ver la consola de todos los servicios o de uno en específico:
```bash
# Todos los servicios
docker-compose logs -f

# De un servicio específico (ej. api-gateway)
docker-compose logs -f api-gateway
```

### Reiniciar un servicio específico
Si realizas un cambio y quieres reconstruir o reiniciar un solo contenedor:
```bash
docker-compose restart api-gateway
```

### Apagar el entorno
Para detener todos los servicios sin borrar los datos de la base de datos:
```bash
docker-compose down
```

Para apagar destruyendo los volúmenes de datos (reinicio de base de datos a cero):
```bash
docker-compose down -v
```

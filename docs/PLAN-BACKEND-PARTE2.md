# Plan: Completar Parte 2 (Backend)

## Decisiones confirmadas

- **Alcance**: RBAC+Guards+JWT, JWT en Gateway, Logging técnico, 3 servicios vacíos, estados de elección completos, Exception Filters globales.
- **MFA**: queda fuera de este plan. El campo `mfaSecret` ya existe en `Administrador`; el flujo de login queda preparado para añadir TOTP después.
- **Sin capa Repository** (Prisma directo).
- **Seed de admin** incluido.
- **Enfoque**: paquete compartido `packages/common` con guards, decorators, filtros e interceptores reutilizables por todos los servicios (usa `jsonwebtoken` directo, sin `@nestjs/passport` por servicio — minimiza dependencias).

## Arquitectura de seguridad

```
Cliente → API Gateway (verifica JWT, rechaza 401 si inválido)
           → reenvía Authorization + x-user-id/x-user-rol a servicio interno
              → Servicio interno (JwtAuthGuard re-verifica JWT, RolesGuard valida rol)
                 → handler
```

**Defensa en profundidad**: el gateway verifica Y cada servicio re-verifica. No se confía solo en headers.

**Roles del schema**: `ESTUDIANTE`, `PROFESOR`, `ADMINISTRADOR_ELECTORAL`, `AUDITOR`, `SUPER_ADMINISTRADOR`.

---

## FASE 1 — Paquete compartido `packages/common` (nuevo)

Estructura:

```
packages/common/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── interfaces/jwt-payload.interface.ts
    ├── decorators/
    │   ├── public.decorator.ts        # @Public()
    │   ├── roles.decorator.ts         # @Roles(...roles)
    │   └── current-user.decorator.ts  # @CurrentUser()
    ├── guards/
    │   ├── jwt-auth.guard.ts          # verifica JWT, skip @Public(), setea req.user
    │   └── roles.guard.ts             # valida @Roles() contra req.user.rol
    ├── filters/
    │   └── http-exception.filter.ts   # @Catch() global, respuesta estructurada
    └── interceptors/
        └── logging.interceptor.ts     # log técnico (sin body/headers sensibles)
```

- `JwtAuthGuard`: extrae `Bearer <token>`, `jwt.verify(token, JWT_SECRET)`, asigna `req.user = payload`. Si `@Public()` → skip.
- `RolesGuard`: si `@Roles()` definido → compara `req.user.rol`; si no → solo requiere autenticación.
- `HttpExceptionFilter`: `{ statusCode, message, timestamp, path }` + log.
- `LoggingInterceptor`: log método+URL+latencia. **No** loguea body ni identidad (REGLA 8).

---

## FASE 2 — API Gateway: verificación JWT

- **Nuevo**: `apps/backend/api-gateway/src/middleware/jwt-auth.middleware.ts`
  - Paths públicos: `/api/auth/login`, `/api/auth/refresh`, cualquier `/health`
  - Verifica JWT → 401 si inválido; setea `x-user-id`, `x-user-rol`, `x-user-email` headers y `next()`.
- **Edit**: `app.module.ts` registra `JwtAuthMiddleware` **primero** (antes de los proxies).
- **Edit**: `package.json` añade `jsonwebtoken`, `@types/jsonwebtoken`.

---

## FASE 3 — Auth-service

- **Controller**: `@Public()` en `login`, `refresh`, `health`. Nuevo `GET /auth/profile` con `@CurrentUser()` (protegido, para probar auth).
- **Service**: `login(identificador, password)` combinado (valida + genera tokens). `Logger` para login OK (sin identificador), errores, refresh fallido.
- **Module**: `APP_GUARD` = `JwtAuthGuard` + `RolesGuard` de `common`.
- **main.ts**: `useGlobalFilters(HttpExceptionFilter)` + `useGlobalInterceptors(LoggingInterceptor)`.
- **Borrados**: `strategies/jwt.strategy.ts` (vacío), `guards/local-auth.guard.ts` (vacío) — reemplazados por `common`.
- **`common/constants.ts`**: llenado con `ROLES` map y `PUBLIC_ROUTES`.
- **package.json**: añade `common: workspace:*`, `jsonwebtoken`, `@types/jsonwebtoken`.

---

## FASE 4 — Servicios protegidos (5)

Para `electoral`, `candidate`, `padron-simple`, `audit`, `dashboard`:

- **package.json**: añade `common`, `jsonwebtoken`, `@types/jsonwebtoken`.
- **app.module.ts**: `APP_GUARD` × 2 (JwtAuthGuard + RolesGuard).
- **main.ts**: `useGlobalFilters` + `useGlobalInterceptors`.
- **Controllers**: `@Public()` en health; `@Roles(...)` en escritura.
- **Services**: `Logger` para errores y eventos admin (sin votos/identidad).

Rol por servicio:

| Servicio | Read | Write |
|---|---|---|
| electoral | cualquier autenticado | `ADMINISTRADOR_ELECTORAL`, `SUPER_ADMINISTRADOR` |
| candidate | cualquier autenticado | `ADMINISTRADOR_ELECTORAL`, `SUPER_ADMINISTRADOR` |
| padron-simple | `ADMIN*`, `AUDITOR` | `ADMIN*` |
| audit | `AUDITOR`, `ADMIN*` | `SUPER_ADMINISTRADOR` (logEvent) |
| dashboard | `ADMIN*`, `AUDITOR` | — |

---

## FASE 5 — Estados de elección completos (electoral-service)

State machine completa:

```
BORRADOR → PROGRAMADA   (programar: requiere fechas)
PROGRAMADA → ACTIVA      (activar) [existente]
BORRADOR → ACTIVA        (activar) [existente]
ACTIVA → CERRADA         (cerrar) [existente]
CERRADA → FINALIZADA     (finalizar) [nuevo]
FINALIZADA → ARCHIVADA   (archivar) [nuevo]
```

Nuevos métodos en `electoral.service.ts` + endpoints `@Patch(':id/programar|finalizar|archivar')` con `@Roles(...)`.

---

## FASE 6 — Servicios vacíos (3 nuevos)

### 6.1 `admin-service` (puerto 3013)
- Gestión de administradores (CRUD + activate/deactivate).
- Crea `Usuario` (rol `ADMINISTRADOR_ELECTORAL`/`SUPER_ADMINISTRADOR`) + `Administrador`.
- Todos los endpoints `@Roles('SUPER_ADMINISTRADOR')` salvo health.
- Estructura: `src/main.ts`, `app.module.ts`, `prisma/prisma.service.ts`, `admin/{module,controller,service,dto}`.

### 6.2 `faculty-service` (puerto 3014)
- CRUD de facultades, escuelas, carreras (con relaciones jerárquicas).
- Read: cualquier autenticado. Write: `@Roles('ADMIN*')`.
- Endpoints: `/facultades`, `/escuelas`, `/carreras` + rutas jerárquicas (`/facultades/:id/escuelas`).

### 6.3 `notification-service` (puerto 3009)
- Email/push/sms vía `nodemailer` (SMTP desde env).
- Plantillas: `election-opened`, `election-closed`, `vote-confirmation`.
- `@Roles('ADMIN*')` en send; `@Public()` en health.
- **REGLA 8**: nunca incluye contenido de voto, nullifiers, commitments, datos criptográficos.

Cada servicio con su `tsconfig.json`, `nest-cli.json`, `prisma/schema.prisma` (copia del maestro).

---

## FASE 7 — Seed de administrador inicial

- **Nuevo**: `packages/database/prisma/seed.ts`
  - `upsert` de `SUPER_ADMINISTRADOR`: `admin@universidad.edu` / `Admin123456`.
  - Crea `Usuario` + `Administrador` (rol `SUPER_ADMIN`).
- **Edit**: `packages/database/package.json` añade `prisma.seed` config + deps `bcrypt`, `@types/bcrypt`.
- Script raíz `db:seed` ya existe.

---

## FASE 8 — Integración raíz

- **`package.json` raíz**: nuevos scripts `dev:admin-service`, `dev:faculty`, `dev:notification`.
- **`tsconfig.base.json`**: path `"@common/*": ["packages/common/src/*"]`.
- **`.env.example`**: `NOTIFICATION_PORT`, `SMTP_*`, `WEB_APP_URL`, `ADMIN_PORT`, `FACULTY_PORT`.
- **Gateway**: 3 nuevos proxies (`admin-proxy`, `faculty-proxy`, `notification-proxy`) registrados en `app.module.ts`.
- **`pnpm-workspace.yaml`**: `common` cubierto por glob `packages/*`. `bcrypt` ya en `allowBuilds`.

---

## Orden de ejecución

1. FASE 1: `packages/common`
2. FASE 2: JWT middleware en gateway
3. FASE 3: auth-service
4. FASE 4: 5 servicios existentes
5. FASE 5: estados de elección
6. FASE 6: 3 servicios vacíos
7. FASE 7: seed
8. FASE 8: integración raíz
9. Verificación: `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, build de servicios, smoke test.

## Verificación final

- Login admin (email) → JWT → `GET /api/auth/profile` con Bearer → 200.
- Sin token → `POST /api/elecciones` → 401.
- Token estudiante → `POST /api/elecciones` → 403.
- Token admin → `POST /api/elecciones` → 201.
- `PATCH /api/elecciones/:id/programar` → OK.
- `GET /api/notifications/send` sin token → 401.
- Cualquier error → respuesta estructurada del filter.

---

## Notas

- **MFA**: diferido. El flujo de login admin queda por email+password. Cuando se implemente, se añadirá `otplib` + `POST /auth/mfa/setup` y validación TOTP en login si el usuario es admin.
- **`padron-simple`**: se mantiene el nombre (renombrar rompería scripts). Documentado como "padron-service" en README.
- **Repository layer**: no se añade (Prisma directo, decisión confirmada).

# Plan: Migrar autenticación de email → DNI/carnet

## Decisiones confirmadas

- **Estudiante**: login con DNI **o** código universitario (cualquiera de los dos).
- **Docente**: login con DNI.
- **Admin**: login con email + MFA (sin cambios para esta tarea; MFA es feature separada, no implementada aún).
- **`email`** en `Usuario`: se mantiene `@unique`, pero **ya no se usa para login** (solo para notificaciones).
- **`dni`**: se añade `@unique` nullable a `Usuario` (denormalizado; también sigue en `Estudiante`/`Profesor`).
- **Alcance**: solo backend, solo cambios de código (sin ejecutar `prisma migrate`).
- **Frontend**: fuera de alcance.

## Verificación del estado actual

- **No existen migraciones** (`prisma/migrations` no existe) → añadir `dni` ahora se incluirá en la migración inicial cuando la ejecutes, sin conflictos.
- El schema maestro está **duplicado en 6 archivos** (idénticos): `packages/database` + 5 servicios que tienen su propia copia (`audit`, `dashboard`, `candidate`, `padron-simple`, `electoral`).
- El login por email toca solo 3 archivos en `auth-service` + 1 en `padron-simple`.
- `jwt.strategy.ts` y `local-auth.guard.ts` están **vacíos** (0 líneas) → no requieren edits.
- `shared-types` está vacío → sin edits.

---

## Cambios de código (10 archivos)

### 1. Schema Prisma — añadir `dni` a `Usuario` (6 archivos idénticos)

**Archivos:**

- `packages/database/prisma/schema.prisma`
- `apps/backend/audit-service/prisma/schema.prisma`
- `apps/backend/dashboard-service/prisma/schema.prisma`
- `apps/backend/candidate-service/prisma/schema.prisma`
- `apps/backend/padron-simple/prisma/schema.prisma`
- `apps/backend/electoral-service/prisma/schema.prisma`

**Cambio** en el bloque `model Usuario`:

```prisma
model Usuario {
  id              String         @id @default(uuid())
  nombre          String
  email           String         @unique
  dni             String?        @unique   // NUEVO: nullable (admins no tienen DNI)
  passwordHash    String
  rol             RolUsuario     @default(ESTUDIANTE)
  estado          EstadoUsuario  @default(ACTIVO)
  ...
}
```

`dni` es `String?` (nullable) porque los administradores no tienen DNI. `@unique` en Postgres permite múltiples NULLs, así que los admins coexisten sin conflicto.

### 2. DTO de login — renombrar `email` → `identificador`

**Archivo:** `apps/backend/auth-service/src/auth/dto/login.dto.ts`

```typescript
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El identificador es obligatorio' })
  identificador: string; // DNI, código universitario o email (admin)

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
```

Se elimina `@IsEmail` porque el campo ahora admite DNI (numérico), código (alfanumérico) o email.

### 3. Auth service — nueva lógica de `validateUser`

**Archivo:** `apps/backend/auth-service/src/auth/auth.service.ts`

`validateUser(email, password)` → `validateUser(identificador, password)` con búsqueda combinada:

```typescript
async validateUser(identificador: string, password: string) {
  // El identificador puede ser: DNI (estudiante/docente), código universitario (estudiante) o email (admin)
  const usuario = await prisma.usuario.findFirst({
    where: {
      OR: [
        { dni: identificador },                                 // DNI (estudiante o docente)
        { email: identificador },                               // email (solo admins)
        { estudiante: { codigoUniversitario: identificador } }, // código universitario
      ],
    },
    include: {
      estudiante: true,
      profesor: true,
      administrador: true,
    },
  });

  if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
  if (usuario.estado !== 'ACTIVO') throw new UnauthorizedException('Cuenta inactiva o bloqueada');

  const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
  if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

  // ... construir additionalInfo (estudiante/profesor/admin) como hoy
  return {
    id: usuario.id,
    email: usuario.email,
    dni: usuario.dni,        // NUEVO
    nombre: usuario.nombre,
    rol: usuario.rol,
    ...additionalInfo,
  };
}
```

Una sola query `OR` cubre los 3 casos (DNI, código, email). `include: { profesor: true }` se añade para que los docentes también resuelvan su info.

### 4. JWT payload y respuesta de `login()` — añadir `dni`

**Archivo:** `apps/backend/auth-service/src/auth/auth.service.ts`

```typescript
const payload = {
  sub: user.id,
  email: user.email,
  dni: user.dni ?? null,   // NUEVO
  rol: user.rol,
};
```

Y en el `return` de `login()`, añadir `dni: user.dni ?? null` al objeto `user` devuelto, y propagar `profesorId` cuando corresponda.

### 5. `refreshTokens()` — añadir `dni` al nuevo payload

**Archivo:** `apps/backend/auth-service/src/auth/auth.service.ts`

```typescript
const newPayload = {
  sub: usuario.id,
  email: usuario.email,
  dni: usuario.dni ?? null,  // NUEVO
  rol: usuario.rol,
};
```

### 6. Auth controller — usar `identificador`

**Archivo:** `apps/backend/auth-service/src/auth/auth.controller.ts`

```typescript
// 1. Validar credenciales (DNI, código universitario o email para admin)
const user = await this.authService.validateUser(
  loginDto.identificador,
  loginDto.password,
);
```

### 7. Padrón service — setear `dni` al crear `Usuario` + ajustar dedupe

**Archivo:** `apps/backend/padron-simple/src/padron/padron.service.ts`

**7a.** Verificación de duplicados — añadir `{ dni: persona.dni }` al `OR`:

```typescript
const existe = await this.prisma.usuario.findFirst({
  where: {
    OR: [
      { email: persona.email },
      { dni: persona.dni },                       // NUEVO
      ...(tipo === 'ESTUDIANTE'
        ? [
            { estudiante: { dni: persona.dni } },
            { estudiante: { codigoUniversitario: persona.codigo } },
          ]
        : [
            { profesor: { dni: persona.dni } },
            { profesor: { codigoEmpleado: persona.codigo } },
          ]),
    ],
  },
});
```

**7b.** Creación del `Usuario` — setear `dni`:

```typescript
const usuario = await this.prisma.usuario.create({
  data: {
    nombre: persona.nombre,
    email: persona.email,
    dni: persona.dni,           // NUEVO
    passwordHash: hashedPassword,
    rol: tipo === 'ESTUDIANTE' ? 'ESTUDIANTE' : 'PROFESOR',
    estado: 'ACTIVO',
  },
});
```

`email` se conserva en la importación (para notificaciones), `dni` se añade al `Usuario`.

### 8. `estudiantes.csv` — sin cambios

Ya tiene columna `dni` y `email`. La importación actual los lee ambos.

---

## Lo que NO se toca (fuera de alcance)

- **MFA para admins**: la Parte 2 lo exige, pero no está implementado hoy. Queda como tarea separada. El login por email de admin ya funciona; cuando se implemente MFA, se añadirá el paso extra.
- **Frontend** (`apps/web`, `apps/admin`): vacíos; el formulario de login se hará en otra sesión con campo `identificador`.
- **JWT strategy / guards**: archivos vacíos, sin edits.
- **Migraciones**: no se ejecuta `prisma migrate`. Cuando lo corras, detectará el nuevo `dni` y generará la migración.
- **`shared-types`**: vacío.

---

## Orden de ejecución sugerido

1. Editar los **6 schemas Prisma** (añadir `dni? @unique` a `Usuario`).
2. Editar el **DTO** de login (`email` → `identificador`).
3. Editar el **auth.service** (`validateUser`, `login`, `refreshTokens`).
4. Editar el **auth.controller** (usar `identificador`).
5. Editar el **padron.service** (crear `Usuario` con `dni` + dedupe).
6. Ejecutar `pnpm db:generate` (regenera el Prisma Client con el nuevo campo `dni`).
7. Después, cuando quieras: `pnpm db:migrate -- --name init` (o el nombre que prefieras).

## Validación posterior

- Compilar el auth-service y padron-simple para verificar tipos.
- Probar login con un estudiante creado (DNI, luego código universitario) y con un admin (email).
- Probar importación del `estudiantes.csv` verificando que `Usuario.dni` se setea.

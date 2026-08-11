# Guia de Instalacion o Migracion

Esta guia es para entregar el proyecto al equipo tecnico que lo montara en un
servidor de CONESTUDIOS.

## 1. Requisitos Actuales

La aplicacion fue construida para:

- Node.js `>=22.13.0`
- pnpm
- Runtime compatible con Cloudflare Workers
- Base de datos tipo Cloudflare D1, compatible con SQLite

Si el servidor destino es Cloudflare Workers + D1, el montaje es directo. Si el
servidor destino es cPanel, VPS, Apache, Nginx, PHP/MySQL o Node.js puro, se
debe hacer una adaptacion pequena pero importante en la capa de servidor.

## 2. Variables de Entorno

Configurar en el servidor:

```bash
CHECKLIST_USERNAME=conestudios
CHECKLIST_PASSWORD=CAMBIAR_ESTA_CLAVE
CHECKLIST_SESSION_SECRET=CAMBIAR_POR_UN_SECRETO_LARGO_ALEATORIO
```

Recomendaciones:

- Cambiar la clave antes de pasar a produccion.
- Usar un secreto de sesion largo, aleatorio y privado.
- No guardar claves reales en Git ni en archivos publicos.
- Si `CHECKLIST_PASSWORD` no se define, el login queda deshabilitado por
  seguridad.

## 3. Instalacion Local Para Revision

```bash
pnpm install
pnpm dev
```

Luego abrir:

```text
http://localhost:3000
```

## 4. Build y Pruebas

```bash
pnpm test
```

Ese comando compila la aplicacion y ejecuta la prueba basica de interfaz.

## 5. Base de Datos

Tabla: `checklist_records`

SQL base:

```sql
CREATE TABLE checklist_records (
  id text PRIMARY KEY NOT NULL,
  oferente text NOT NULL,
  municipio text NOT NULL,
  checks text NOT NULL,
  observations text DEFAULT '' NOT NULL,
  updated_at text,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE checklist_records
  ADD delivery_status text DEFAULT 'Sin registrar' NOT NULL;
```

En motores que no acepten `ALTER TABLE ADD` si la columna ya existe, manejar la
migracion con control de existencia.

## 6. Archivos Que Se Adaptan Si No Es Cloudflare

Si el servidor no usa Cloudflare Workers/D1, revisar principalmente:

- `app/api/checklist/route.ts`
- `lib/auth.ts`
- `vite.config.ts`
- `worker/index.ts`

La razon es que hoy la API usa:

```ts
import { env } from "cloudflare:workers";
```

y la base de datos se accede como:

```ts
env.DB.prepare(...)
```

En un servidor Node.js normal eso debe reemplazarse por el cliente de base de
datos que corresponda, por ejemplo MySQL, PostgreSQL o SQLite local.

## 7. Opciones de Montaje

### Opcion A: Cloudflare Workers + D1

Es la opcion mas parecida a la version actual. Requiere crear el proyecto en una
cuenta Cloudflare de CONESTUDIOS y asociar una base D1.

Ventaja: menor adaptacion tecnica.

### Opcion B: Servidor Node.js con base MySQL/PostgreSQL

Requiere adaptar `app/api/checklist/route.ts` para consultar una base del
servidor. La interfaz se conserva casi igual.

Ventaja: queda dentro de infraestructura propia.

### Opcion C: PHP/MySQL o cPanel tradicional

No se puede subir tal cual. Habria que reconstruir la API en PHP o convertir la
aplicacion a un esquema compatible con el hosting.

Ventaja: puede aprovechar el hosting actual.

## 8. Rutas de la Aplicacion

- `GET /`: interfaz web.
- `POST /api/auth/login`: ingreso.
- `POST /api/auth/logout`: salida.
- `GET /api/auth/session`: verifica si hay sesion activa.
- `GET /api/checklist`: lista registros.
- `PATCH /api/checklist`: actualiza un municipio.
- `PUT /api/checklist`: importa/reemplaza registros.
- `POST /api/checklist`: acciones administrativas, por ejemplo reset.

## 9. Datos Iniciales

Los operadores, municipios y entregables estan en:

```text
lib/checklist-data.ts
```

Al iniciar con una base vacia, la API crea los registros iniciales definidos en
ese archivo.

## 10. Entregables de Handoff

El paquete de codigo fuente debe incluir:

- `app/`
- `lib/`
- `db/`
- `drizzle/`
- `build/`
- `worker/`
- `public/`
- `tests/`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.json`
- `vite.config.ts`
- `next.config.ts`
- `drizzle.config.ts`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `README.md`
- `docs/`
- `env.example`

No incluir:

- `node_modules/`
- `dist/`
- `.wrangler/`
- `.next/`
- `.vinext/`
- `work/`
- logs
- archivos `.env` reales

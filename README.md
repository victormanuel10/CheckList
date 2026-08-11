# Checklist HITO 6 - Barrido predial

Aplicacion web para registrar y consultar el avance de entregables del HITO 6
por operador de barrido predial y municipio.

## Funcionalidad

- Login interno por usuario y contrasena.
- Panel general de avance.
- Filtros por operador, estado, entrega de informacion y busqueda.
- Lista de municipios por operador.
- Checklist por grupos de entregables.
- Estados por entregable: `Pendiente`, `Cumple`, `No cumple`, `N/A`.
- Campo de entrega de informacion: `Sin registrar`, `Entrego`, `No entrego`.
- Observaciones por municipio.
- Exportacion a JSON, CSV y Excel.
- API protegida para lectura y escritura de la base.

## Tecnologia

- Next.js 16
- React 19
- Vinext
- Cloudflare Workers runtime
- Cloudflare D1 / SQLite semantics
- Drizzle para definicion y migraciones de base de datos
- pnpm

## Estructura Principal

- `app/page.tsx`: interfaz principal, dashboard, filtros, exportes y login.
- `app/globals.css`: estilos visuales de la aplicacion.
- `app/layout.tsx`: metadata principal.
- `app/api/checklist/route.ts`: API de registros del checklist.
- `app/api/auth/login/route.ts`: ingreso.
- `app/api/auth/logout/route.ts`: salida.
- `app/api/auth/session/route.ts`: validacion de sesion.
- `lib/checklist-data.ts`: operadores, municipios, campos, estados y calculos.
- `lib/auth.ts`: validacion de credenciales y cookie de sesion.
- `db/schema.ts`: definicion Drizzle de la tabla.
- `drizzle/`: migraciones SQL.
- `tests/rendered-html.test.mjs`: prueba basica de build/interfaz.
- `docs/INSTALACION_SERVIDOR.md`: guia para montaje o migracion.
- `env.example`: variables de entorno requeridas.

## Variables de Entorno

Copiar `env.example` y configurar valores reales en el servidor.

```bash
CHECKLIST_USERNAME=conestudios
CHECKLIST_PASSWORD=CAMBIAR_ESTA_CLAVE
CHECKLIST_SESSION_SECRET=CAMBIAR_POR_UN_SECRETO_LARGO_ALEATORIO
```

En produccion no se recomienda dejar claves escritas en el codigo fuente. El
servidor debe inyectarlas como variables de entorno.

Si `CHECKLIST_PASSWORD` no esta configurada, el login queda deshabilitado por
seguridad.

## Comandos

Instalar dependencias:

```bash
pnpm install
```

Ejecutar en desarrollo:

```bash
pnpm dev
```

Compilar:

```bash
pnpm build
```

Probar:

```bash
pnpm test
```

Generar migraciones si cambia `db/schema.ts`:

```bash
pnpm db:generate
```

## Base de Datos

La tabla principal es `checklist_records`.

Campos:

- `id`: identificador del municipio.
- `oferente`: operador.
- `municipio`: municipio.
- `delivery_status`: estado de entrega de informacion.
- `checks`: JSON con los estados de cada entregable.
- `observations`: observaciones.
- `updated_at`: fecha de ultima actualizacion.
- `created_at`: fecha de creacion.

Las migraciones estan en `drizzle/`.

## Nota Importante Para Servidor Propio

Esta version esta preparada para Cloudflare Workers/D1. Si el servidor de la
empresa es cPanel, PHP/MySQL, VPS tradicional o Node.js sin Cloudflare runtime,
hay que adaptar la capa de base de datos y entorno. La interfaz y la logica de
checklist se pueden reutilizar.

Ver `docs/INSTALACION_SERVIDOR.md` antes de montar.

# Seed — Unidad Organizacional (idempotente)

Este seed carga los **catálogos de unidad organizacional** en SQL Server:

**Área → Dirección → Departamento → Oficina → Sección/Programa**

- **Idempotente**: si el registro existe (por `nombre` + su FK padre), **no duplica**.
- Se puede ejecutar varias veces (por ejemplo, cuando agregas nuevas oficinas)(upsert).

## Ubicación sugerida en el repo
 `apps/backend/prisma/`:

```
apps/backend/prisma/
  seed.ts
  seed-data/
    unidad-organizacional.json
  README.md
```

## Requisitos

- Node + Prisma configurado
- Acceso a la DB por `DATABASE_URL` en tu `.env`

## Seguridad: bloqueo en producción

Por seguridad, el seed está bloqueado en producción cuando:
```
NODE_ENV=production
```

Si alguna vez necesitas ejecutarlo en producción, debes habilitarlo explícitamente con:

ALLOW_DB_SEED=true

## Configurar el comando seed (package.json)

En `apps/backend/package.json` agregar:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed"
  }
}
```

## Ajustar nombres de tablas/columnas

En `seed.ts` hay un bloque **CONFIG** para ajustar si se usan otros nombres en la BD:

- Schema: `dbo`
- Tablas: `area`, `direccion`, `departamento`, `oficina`, `seccion_programa`
- PKs: `id_area`, `id_direccion`, `id_departamento`, `id_oficina`, `id_seccion_programa`
- FK: `id_area`, `id_direccion`, `id_departamento`, `id_oficina`
- Columna nombre: `nombre`

## Cómo agregar una nueva oficina / sección (a futuro)

1. Editar `prisma/seed-data/unidad-organizacional.json`
2. Hay un example del json en `prisma/seed-data/unidad-organizacional.example.json`
3. Agregar un nuevo objeto con esta forma:

```json
{
  "area": "MUNICIPAL/SALUD/EDUCACION/OTRA",
  "direccion": "DIRECCION X",
  "departamento": "DEPARTAMENTO X",
  "oficina": "OFICINA X",
  "seccion_programa": "SECCION/PROGRAMA X"
}
```

4. Ejecutar el seed:

```bash
npm run db:seed
```

## Recomendación: constraints únicos

Para blindar contra duplicados (y mejorar performance), agregar índices únicos:

- Área: `UNIQUE(nombre)`
- Dirección: `UNIQUE(id_area, nombre)`
- Departamento: `UNIQUE(id_direccion, nombre)`
- Oficina: `UNIQUE(id_departamento, nombre)`
- Sección/Programa: `UNIQUE(id_oficina, nombre)`



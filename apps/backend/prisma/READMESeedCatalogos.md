# Seed Catálogos

Este script carga catálogos base del sistema (tipos, estados y clasificaciones) de forma **idempotente**:
- Si el valor ya existe (por `nombre`), no lo duplica.
- Si falta, lo crea con `activo=true`.

## Script
- `prisma/scripts/seedCatalogos.ts`

## Ejecutar (local / desarrollo)
Desde `apps/backend`:

```bash
pnpm seed:catalogos
```

Para modificar los estados o los valores de los catálogos, editar el archivo `prisma/scripts/seedCatalogos.ts`.
Esta modificiacion está contemplada hacerlo desde el seed ya que son datos que faltan por pulir.

## Querys

Ver totalidad de catálogos:
```
SELECT COUNT(*) AS total FROM dbo.cat_tipo_adquisicion;
SELECT COUNT(*) AS total FROM dbo.cat_modalidad;
SELECT COUNT(*) AS total FROM dbo.cat_unidad_gestora;
SELECT COUNT(*) AS total FROM dbo.cat_clasificacion_activo;
SELECT COUNT(*) AS total FROM dbo.cat_estado_activo;
SELECT COUNT(*) AS total FROM dbo.cat_cargo;
SELECT COUNT(*) AS total FROM dbo.cat_tipo_interfaz;
SELECT COUNT(*) AS total FROM dbo.cat_estado_ip;
SELECT COUNT(*) AS total FROM dbo.cat_tipo_usabilidad;
SELECT COUNT(*) AS total FROM dbo.cat_tipo_asignacion;
```

Ver los valores:

``` 
SELECT TOP 100 * FROM dbo.cat_tipo_adquisicion ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_modalidad ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_unidad_gestora ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_clasificacion_activo ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_estado_activo ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_cargo ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_tipo_interfaz ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_estado_ip ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_tipo_usabilidad ORDER BY nombre;
SELECT TOP 100 * FROM dbo.cat_tipo_asignacion ORDER BY nombre;
 ```
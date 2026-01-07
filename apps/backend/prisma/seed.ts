/**
 * Prisma DB seed — Areas y sub-areas
 *
 * Carga catálogos jerárquicos:
 * Área -> Dirección -> Departamento -> Oficina -> Sección/Programa
 *
 * Es idempotente: si ya existe, reutiliza el ID.
 *
 * Ajusta los nombres de tablas/columnas si el esquema es distinto.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type UORow = {
  area: string;
  direccion: string;
  departamento: string;
  oficina: string;
  seccion_programa: string;
};

function boolOrUndef(v?: string) {
  if (v == null) return undefined;
  return v.toLowerCase() === "true";
}

/**
 * DATABASE_URL tipo:
 * sqlserver://SERVER:1433;database=DB;user=USER;password=PASS;encrypt=true;trustServerCertificate=true
 */
function adapterFromDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no está definida.");

  const m = url.match(/^sqlserver:\/\/([^:;]+)(?::(\d+))?;(.*)$/i);
  if (!m) {
    throw new Error(
      "DATABASE_URL no tiene el formato esperado para sqlserver://...;database=...;user=...;password=..."
    );
  }

  const server = m[1];
  const port = Number(m[2] ?? "1433");
  const paramsRaw = m[3];

  const params: Record<string, string> = {};
  for (const part of paramsRaw.split(";")) {
    if (!part.trim()) continue;
    const [k, ...rest] = part.split("=");
    params[k.trim().toLowerCase()] = rest.join("=").trim();
  }

  const database = params["database"];
  const user = params["user"];
  const password = params["password"];

  if (!database || !user || !password) {
    throw new Error("Faltan parámetros en DATABASE_URL: database/user/password.");
  }

  return new PrismaMssql({
    server,
    port,
    database,
    user,
    password,
    options: {
      encrypt: boolOrUndef(params["encrypt"]),
      trustServerCertificate: boolOrUndef(params["trustservercertificate"]),
    },
  });
}

const adapter = adapterFromDatabaseUrl();
const prisma = new PrismaClient({ adapter });


// ====== CONFIG (ajustar si se usa otros nombres, leer READMEdeSeed.md) ======
const DB_SCHEMA = "dbo";

// Tablas
const T_AREA = "area";
const T_DIR = "direccion";
const T_DEPTO = "departamento";
const T_OFIC = "oficina";
const T_SECC = "seccion_programa";

// PKs
const PK_AREA = "id_area";
const PK_DIR = "id_direccion";
const PK_DEPTO = "id_departamento";
const PK_OFIC = "id_oficina";
const PK_SECC = "id_seccion_programa";

// Nombre (display)
const COL_NOMBRE = "nombre";
const COL_ACTIVO = "activo";

// FKs (padres)
const FK_DIR_AREA = "id_area";
const FK_DEPTO_DIR = "id_direccion";
const FK_OFIC_DEPTO = "id_departamento";
const FK_SECC_OFIC = "id_oficina";

// Seed data file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "seed-data", "unidad-organizacional.json");

// Safety switch
const ALLOW_SEED = process.env.ALLOW_DB_SEED === "true";

function assertIdent(name: string) {
  // Prevent SQL injection in identifiers (table/column/schema names)
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Identificador SQL inválido: "${name}"`);
  }
}

function qIdent(name: string) {
  assertIdent(name);
  return Prisma.raw(`[${name}]`);
}

function qTable(schema: string, table: string) {
  assertIdent(schema);
  assertIdent(table);
  return Prisma.raw(`[${schema}].[${table}]`);
}

function clean(s: string) {
  return (s ?? "").trim();
}

async function getOrCreateByName(
  db: Prisma.TransactionClient,
  params: {
    schema: string;
    table: string;
    pk: string;
    name: string;
    parent?: { fk: string; id: number };
  }
): Promise<number> {
  const { schema, table, pk, name, parent } = params;
  const fullTable = qTable(schema, table);
  const pkCol = qIdent(pk);
  const nameCol = qIdent(COL_NOMBRE);

  // 1) Try select
  const whereParent = parent
    ? Prisma.sql` AND ${qIdent(parent.fk)} = ${parent.id}`
    : Prisma.empty;

  const found = await db.$queryRaw<{ id: number }[]>(
    Prisma.sql`
      SELECT TOP 1 ${pkCol} AS id
      FROM ${fullTable}
      WHERE ${nameCol} = ${name}
      ${whereParent}
    `
  );

  if (found.length) return found[0].id;

  // 2) Insert and return ID (OUTPUT)
  // If there is a unique constraint and another process inserted simultaneously,
  // we retry by selecting again.
  try {
    const activoCol = qIdent(COL_ACTIVO);

    const cols = parent
      ? Prisma.sql`${nameCol}, ${activoCol}, ${qIdent(parent.fk)}`
      : Prisma.sql`${nameCol}, ${activoCol}`;

    const vals = parent
      ? Prisma.sql`${name}, ${1}, ${parent.id}`
      : Prisma.sql`${name}, ${1}`;

    const inserted = await db.$queryRaw<{ id: number }[]>(
      Prisma.sql`
        INSERT INTO ${fullTable} (${cols})
        OUTPUT INSERTED.${pkCol} AS id
        VALUES (${vals})
      `
    );

    if (!inserted.length) {
      throw new Error(`No se pudo insertar en ${schema}.${table}: ${name}`);
    }
    return inserted[0].id;
  } catch (e) {
    // Race condition fallback
    const retry = await db.$queryRaw<{ id: number }[]>(
      Prisma.sql`
        SELECT TOP 1 ${pkCol} AS id
        FROM ${fullTable}
        WHERE ${nameCol} = ${name}
        ${whereParent}
      `
    );
    if (retry.length) return retry[0].id;
    throw e;
  }
}

function assertSeedAllowed() {
  const isProd = process.env.NODE_ENV === "production";
  const allowed = process.env.ALLOW_DB_SEED === "true";

  if (isProd && !allowed) {
    throw new Error(
      "Seed bloqueado en producción. Si estás 100% seguro, ejecuta con ALLOW_DB_SEED=true."
    );
  }
}

async function main() {
  assertSeedAllowed();

  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(`No existe el archivo de datos: ${DATA_PATH}`);
  }

  const rows = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as UORow[];

  // Deduplicar duplicados exactos después de recortar espacios
  const normalized: UORow[] = rows
    .map((r) => ({
      area: clean(r.area),
      direccion: clean(r.direccion),
      departamento: clean(r.departamento),
      oficina: clean(r.oficina),
      seccion_programa: clean(r.seccion_programa),
    }))
    .filter((r) => r.area && r.direccion && r.departamento && r.oficina && r.seccion_programa);

  const seen = new Set<string>();
  const dedup: UORow[] = [];
  for (const r of normalized) {
    const k = `${r.area}||${r.direccion}||${r.departamento}||${r.oficina}||${r.seccion_programa}`;
    if (!seen.has(k)) {
      seen.add(k);
      dedup.push(r);
    }
  }


  //Cache in-memory para evitar re-querying
  const cacheArea = new Map<string, number>();
  const cacheDir = new Map<string, number>();
  const cacheDepto = new Map<string, number>();
  const cacheOfic = new Map<string, number>();

  const stats = { areas: 0, direcciones: 0, deptos: 0, oficinas: 0, secciones: 0 };

  await prisma.$transaction(async (tx) => {
    for (const r of dedup) {
      // Area
      const areaKey = r.area;
      let areaId = cacheArea.get(areaKey);
      if (!areaId) {
        areaId = await getOrCreateByName(tx, {
          schema: DB_SCHEMA,
          table: T_AREA,
          pk: PK_AREA,
          name: r.area,
        });
        cacheArea.set(areaKey, areaId);
        stats.areas++;
      }

      // Dirección
      const dirKey = `${areaId}::${r.direccion}`;
      let dirId = cacheDir.get(dirKey);
      if (!dirId) {
        dirId = await getOrCreateByName(tx, {
          schema: DB_SCHEMA,
          table: T_DIR,
          pk: PK_DIR,
          name: r.direccion,
          parent: { fk: FK_DIR_AREA, id: areaId },
        });
        cacheDir.set(dirKey, dirId);
        stats.direcciones++;
      }

      // Departamento
      const deptoKey = `${dirId}::${r.departamento}`;
      let deptoId = cacheDepto.get(deptoKey);
      if (!deptoId) {
        deptoId = await getOrCreateByName(tx, {
          schema: DB_SCHEMA,
          table: T_DEPTO,
          pk: PK_DEPTO,
          name: r.departamento,
          parent: { fk: FK_DEPTO_DIR, id: dirId },
        });
        cacheDepto.set(deptoKey, deptoId);
        stats.deptos++;
      }

      // Oficina
      const oficKey = `${deptoId}::${r.oficina}`;
      let oficId = cacheOfic.get(oficKey);
      if (!oficId) {
        oficId = await getOrCreateByName(tx, {
          schema: DB_SCHEMA,
          table: T_OFIC,
          pk: PK_OFIC,
          name: r.oficina,
          parent: { fk: FK_OFIC_DEPTO, id: deptoId },
        });
        cacheOfic.set(oficKey, oficId);
        stats.oficinas++;
      }

      // Sección/Programa (no cachea porque puede repetir menos, pero igual podría)
      await getOrCreateByName(tx, {
        schema: DB_SCHEMA,
        table: T_SECC,
        pk: PK_SECC,
        name: r.seccion_programa,
        parent: { fk: FK_SECC_OFIC, id: oficId },
      });
      stats.secciones++;
    }
  });

  console.log("✅ Seed unidad organizacional terminado.");
  console.log("Operaciones (aprox.):", stats);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import "dotenv/config";
import * as process from "node:process";

// ========================
// Seguridad (prod)
// ========================
function assertSeedAllowed() {
    const isProd = process.env.NODE_ENV === "production";
    const allowed = process.env.ALLOW_DB_SEED === "true";

    if (isProd && !allowed) {
        throw new Error(
            "Seed bloqueado en producción. Si estás 100% seguro, ejecuta con ALLOW_DB_SEED=true."
        );
    }
}

function boolOrUndef(v?: string) {
    if (v == null) return undefined;
    return v.toLowerCase() === "true";
}

/**
 * Espera DATABASE_URL tipo SQL Server:
 * sqlserver://IP:1433;database=DB;user=USER;password=PASS;encrypt=true;trustServerCertificate=true
 */
function adapterFromDatabaseUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL no está definida.");

    const m = url.match(/^sqlserver:\/\/([^:;]+)(?::(\d+))?;(.*)$/i);
    if (!m) {
        throw new Error(
            "DATABASE_URL no tiene el formato esperado: sqlserver://...;database=...;user=...;password=..."
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

const prisma = new PrismaClient({ adapter: adapterFromDatabaseUrl() });

// ========================
// Datos de catálogos:
// Sujeto a cambios
// ========================
const CATALOGOS = {
    cat_tipo_adquisicion: [
        "Compra Ágil",
        "Convenio Marco",
        "Enviado por tercero",
        "Licitación",
        "Trato directo",
        "Trato directo menor a 3 UTM",
    ],
    cat_modalidad: ["Servicio de arriendo", "Compra"],
    cat_unidad_gestora: ["Municipal", "Salud", "Educación"],
    cat_clasificacion_activo: ["Computadoras", "Impresoras", "Accesorios", "Dispositivo móvil"],
    cat_estado_activo: ["En servicio", "Disponible"],
    cat_cargo: ["Asistente social", "Programador", "Soporte", "Diseñador gráfico", "Abogado"],
    cat_tipo_interfaz: ["Ethernet", "WiFi"],
    cat_estado_ip: ["Asignado", "Disponible"],
    cat_tipo_usabilidad: ["Para préstamo", "CCTV"],
    cat_tipo_asignacion: ["Asignación", "Asignado", "Préstamo", "Permanente", "Reasignación"],
} as const;

// ========================
// Helper idempotente
// ========================
async function seedUniqueNombre(
    tabla: string,
    delegate: {
        findUnique: (args: any) => Promise<any>;
        create: (args: any) => Promise<any>;
    },
    nombres: readonly string[]
) {
    let created = 0;
    let existing = 0;

    for (const nombre of nombres) {
        const found = await delegate.findUnique({ where: { nombre } });
        if (found) {
            existing++;
            continue;
        }
        await delegate.create({ data: { nombre, activo: true } });
        created++;
    }

    console.log(`✅ ${tabla}: creados=${created}, existentes=${existing}`);
}

// ========================
// Main
// ========================
async function main() {
    assertSeedAllowed();

    await seedUniqueNombre(
        "cat_tipo_adquisicion",
        prisma.cat_tipo_adquisicion,
        CATALOGOS.cat_tipo_adquisicion
    );
    await seedUniqueNombre("cat_modalidad", prisma.cat_modalidad, CATALOGOS.cat_modalidad);
    await seedUniqueNombre(
        "cat_unidad_gestora",
        prisma.cat_unidad_gestora,
        CATALOGOS.cat_unidad_gestora
    );
    await seedUniqueNombre(
        "cat_clasificacion_activo",
        prisma.cat_clasificacion_activo,
        CATALOGOS.cat_clasificacion_activo
    );
    await seedUniqueNombre(
        "cat_estado_activo",
        prisma.cat_estado_activo,
        CATALOGOS.cat_estado_activo
    );
    await seedUniqueNombre("cat_cargo", prisma.cat_cargo, CATALOGOS.cat_cargo);
    await seedUniqueNombre(
        "cat_tipo_interfaz",
        prisma.cat_tipo_interfaz,
        CATALOGOS.cat_tipo_interfaz
    );
    await seedUniqueNombre("cat_estado_ip", prisma.cat_estado_ip, CATALOGOS.cat_estado_ip);
    await seedUniqueNombre(
        "cat_tipo_usabilidad",
        prisma.cat_tipo_usabilidad,
        CATALOGOS.cat_tipo_usabilidad
    );
    await seedUniqueNombre(
        "cat_tipo_asignacion",
        prisma.cat_tipo_asignacion,
        CATALOGOS.cat_tipo_asignacion
    );
    // tipo_activo (necesario para crear activos)
    const tipoActivoNombre = "General";

    const tipoActivoExiste = await prisma.tipo_activo.findFirst({
        where: { nombre: tipoActivoNombre },
        select: { id_tipo_activo: true },
    });

    if (!tipoActivoExiste) {
        await prisma.tipo_activo.create({
            data: { nombre: tipoActivoNombre, activo: true },
        });
    }

    console.log("🎉 Seed de catálogos completado.");
}

main()
    .catch((e) => {
        console.error("❌ Error en seedCatalogos:", e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

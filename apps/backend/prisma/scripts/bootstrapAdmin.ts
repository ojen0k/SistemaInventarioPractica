import "dotenv/config";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

function assertAllowed() {
    if (process.env.ALLOW_BOOTSTRAP !== "true") {
        throw new Error("Bootstrap bloqueado. Ejecuta con ALLOW_BOOTSTRAP=true");
    }
}

function adapterFactoryFromDatabaseUrl() {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error("DATABASE_URL no está definida.");

    // limpia comillas si existen
    const url = raw.trim().replace(/^['"]|['"]$/g, "");

    // formato
    // sqlserver://HOST:PORT;database=DB;user=USER;password=PASS
    // este formato es el que separa la contraseña de lo que sigue despues de
    //la contraseña (leia todo el encrypt y trustServerCertificate y no podia logearse)
    const m = url.match(
        /^sqlserver:\/\/([^:;]+):(\d+);database=([^;]+);user=([^;]+);password=([^;]+);encrypt=(true|false);trustServerCertificate=(true|false)$/
    );

    if (!m) {
        throw new Error(
            "DATABASE_URL no tiene el formato esperado (sqlserver://HOST:PORT;database=DB;user=USER;password=PASS)"
        );
    }

    const [, server, portStr, database, user, password] = m;

    const port = Number(portStr);

    const config = {
        server,
        port,
        database,
        user,
        password,
        options: { encrypt: true, trustServerCertificate: true },
    };

    return new PrismaMssql(config as any);
}


async function main() {
    assertAllowed();

    const username = process.env.BOOTSTRAP_ADMIN_USER ?? "admin";
    const password = process.env.BOOTSTRAP_ADMIN_PASS;
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? null;

    if (!password) throw new Error("BOOTSTRAP_ADMIN_PASS no está definida.");

    const adapter = adapterFactoryFromDatabaseUrl();
    const prisma = new PrismaClient({ adapter });

    // 1) roles
    const rolAdmin = await prisma.rol.upsert({
        where: { nombre: "Administrador" },
        create: { nombre: "Administrador", activo: true },
        update: { activo: true },
    });

    await prisma.rol.upsert({
        where: { nombre: "Soporte" },
        create: { nombre: "Soporte", activo: true },
        update: { activo: true },
    });

    // 2) usuario admin
    const existing = await prisma.usuario.findFirst({
        where: { OR: [{ nombre_usuario: username }, ...(email ? [{ correo: email }] : [])] },
    });

    if (!existing) {
        const hash = await bcrypt.hash(password, 10);

        const admin = await prisma.usuario.create({
            data: {
                nombre_usuario: username,
                correo: email,
                hash_contrasena: hash,
                activo: true,
            },
        });

        await prisma.usuario_rol.create({
            data: { id_usuario: admin.id_usuario, id_rol: rolAdmin.id_rol },
        });

        console.log(`✅ Admin creado: ${username} (rol Administrador)`);
    } else {
        console.log(`ℹ️ Admin ya existe: ${existing.nombre_usuario}`);

        const hasAdmin = await prisma.usuario_rol.findFirst({
            where: { id_usuario: existing.id_usuario, id_rol: rolAdmin.id_rol },
        });

        if (!hasAdmin) {
            await prisma.usuario_rol.create({
                data: { id_usuario: existing.id_usuario, id_rol: rolAdmin.id_rol },
            });
            console.log("✅ Rol Administrador asignado");
        }

    }

    await prisma.$disconnect();
}


main().catch((e) => {
    console.error(e);
    process.exit(1);
});

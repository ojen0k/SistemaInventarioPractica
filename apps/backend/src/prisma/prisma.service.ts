import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import 'dotenv/config'

function boolOrUndef(v?: string) {
    if (v == null) return undefined;
    return v.toLowerCase() === "true";
}

function adapterFromDatabaseUrl() {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error("DATABASE_URL no está definida.");

    const url = raw.trim().replace(/^['"]|['"]$/g, "");

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


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {

        super({
            adapter: adapterFromDatabaseUrl(),
        })
    }

    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}

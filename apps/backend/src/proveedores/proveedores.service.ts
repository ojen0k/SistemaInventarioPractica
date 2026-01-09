import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProveedoresService {
    constructor(private readonly prisma: PrismaService) { }

    async byRut(raw: string) {
        const rut = (raw ?? "").trim();
        if (!rut) return { found: false };

        const p = await this.prisma.proveedor.findUnique({
            where: { rut_proveedor: rut },
            select: { id_proveedor: true, nombre_proveedor: true },
        });

        if (!p) return { found: false };
        return { found: true, id_proveedor: p.id_proveedor, nombre: p.nombre_proveedor };
    }
}

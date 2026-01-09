import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function mapRow(row: any) {
    // estandariza para el front (id como string)
    return { id: String(row.id), nombre: row.nombre, activo: row.activo };
}


@Injectable()
export class OrgService {
    constructor(private prisma: PrismaService) { }

    async areas() {
        const rows = await this.prisma.area.findMany({
            where: { activo: true },
            orderBy: { nombre: "asc" },
            select: { id_area: true, nombre: true },
        });
        return rows.map((r) => ({ id: r.id_area, nombre: r.nombre }));
    }

    async direcciones(areaId: number) {
        if (!Number.isFinite(areaId)) throw new BadRequestException("areaId inválido");

        const rows = await this.prisma.direccion.findMany({
            where: { activo: true, id_area: areaId },
            orderBy: { nombre: "asc" },
            select: { id_direccion: true, nombre: true },
        });
        return rows.map((r) => ({ id: r.id_direccion, nombre: r.nombre }));
    }

    async departamentos(direccionId: number) {
        if (!Number.isFinite(direccionId)) throw new BadRequestException("direccionId inválido");

        const rows = await this.prisma.departamento.findMany({
            where: { activo: true, id_direccion: direccionId },
            orderBy: { nombre: "asc" },
            select: { id_departamento: true, nombre: true },
        });
        return rows.map((r) => ({ id: r.id_departamento, nombre: r.nombre }));
    }

    async oficinas(departamentoId: number) {
        if (!Number.isFinite(departamentoId)) throw new BadRequestException("departamentoId inválido");

        const rows = await this.prisma.oficina.findMany({
            where: { activo: true, id_departamento: departamentoId },
            orderBy: { nombre: "asc" },
            select: { id_oficina: true, nombre: true },
        });
        return rows.map((r) => ({ id: r.id_oficina, nombre: r.nombre }));
    }

    async seccionesPrograma(oficinaId: number) {
        if (!Number.isFinite(oficinaId)) throw new BadRequestException("oficinaId inválido");

        const rows = await this.prisma.seccion_programa.findMany({
            where: { activo: true, id_oficina: oficinaId },
            orderBy: { nombre: "asc" },
            select: { id_seccion_programa: true, nombre: true },
        });
        return rows.map((r) => ({ id: r.id_seccion_programa, nombre: r.nombre }));
    }
}

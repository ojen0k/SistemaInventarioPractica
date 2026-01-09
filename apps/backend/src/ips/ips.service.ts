import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function isIPv4(s: string) {
    const parts = s.split(".");
    if (parts.length !== 4) return false;
    return parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

@Injectable()
export class IpsService {
    constructor(private readonly prisma: PrismaService) { }

    async check(raw: string) {
        const ip = (raw ?? "").trim();
        if (!ip) return { ip: "", available: true, reason: "empty" };

        if (!isIPv4(ip)) throw new BadRequestException(`IP inválida: ${ip}`);

        const ipRow = await this.prisma.ip_recurso.findUnique({
            where: { ip },
            select: { id_ip_recurso: true, id_estado_ip: true },
        });

        // Si no existe en ip_recurso => disponible
        if (!ipRow) return { ip, available: true, reason: "not_found" };

        // Obtener estados
        const estados = await this.prisma.cat_estado_ip.findMany({
            select: { id_estado_ip: true, nombre: true },
        });

        const findEstado = (needle: string) =>
            estados.find((e) => (e.nombre ?? "").toLowerCase().includes(needle));

        const estadoAsignado = findEstado("asign");
        const estadoDisponible = findEstado("dispon");

        // asignado = ocupado, todo lo demás = disponible
        const isAssigned =
            estadoAsignado && ipRow.id_estado_ip === estadoAsignado.id_estado_ip;

        const isAvailable =
            estadoDisponible
                ? ipRow.id_estado_ip === estadoDisponible.id_estado_ip
                : !isAssigned;

        if (isAvailable) return { ip, available: true, reason: "disponible" };

        // buscar a qué activo está asociada 
        const link = await this.prisma.interfaz_ip.findFirst({
            where: { id_ip_recurso: ipRow.id_ip_recurso },
            select: {
                interfaz_red: { select: { id_activo: true } },
            },
        });

        return {
            ip,
            available: false,
            reason: "asignada",
            assignedToActivoId: link?.interfaz_red?.id_activo ?? null,
        };
    }
}

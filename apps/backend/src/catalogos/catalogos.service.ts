import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export type CatalogKey =
    | "tipo-adquisicion"
    | "modalidad"
    | "unidad-gestora"
    | "clasificacion-activo"
    | "estado-activo"
    | "cargo"
    | "tipo-interfaz"
    | "estado-ip"
    | "tipo-usabilidad"
    | "tipo-asignacion";

@Injectable()
export class CatalogosService {
    constructor(private prisma: PrismaService) { }

    async list(key: CatalogKey) {
        const map: Record<CatalogKey, any> = {
            "tipo-adquisicion": this.prisma.cat_tipo_adquisicion,
            "modalidad": this.prisma.cat_modalidad,
            "unidad-gestora": this.prisma.cat_unidad_gestora,
            "clasificacion-activo": this.prisma.cat_clasificacion_activo,
            "estado-activo": this.prisma.cat_estado_activo,
            "cargo": this.prisma.cat_cargo,
            "tipo-interfaz": this.prisma.cat_tipo_interfaz,
            "estado-ip": this.prisma.cat_estado_ip,
            "tipo-usabilidad": this.prisma.cat_tipo_usabilidad,
            "tipo-asignacion": this.prisma.cat_tipo_asignacion,
        };

        const delegate = map[key];
        if (!delegate) throw new BadRequestException("Catálogo no soportado.");

        const rows = await delegate.findMany({
            orderBy: { nombre: "asc" },
        });

        return rows;
    }
}

import { Controller, Get, Query } from "@nestjs/common";
import { OrgService } from "./org.service";

@Controller("org")
export class OrgController {
    constructor(private org: OrgService) { }

    @Get("areas")
    areas() {
        return this.org.areas();
    }

    @Get("direcciones")
    direcciones(@Query("areaId") areaId: string) {
        return this.org.direcciones(Number(areaId));
    }

    @Get("departamentos")
    departamentos(@Query("direccionId") direccionId: string) {
        return this.org.departamentos(Number(direccionId));
    }

    @Get("oficinas")
    oficinas(@Query("departamentoId") departamentoId: string) {
        return this.org.oficinas(Number(departamentoId));
    }

    @Get("secciones-programa")
    seccionesPrograma(@Query("oficinaId") oficinaId: string) {
        return this.org.seccionesPrograma(Number(oficinaId));
    }
}

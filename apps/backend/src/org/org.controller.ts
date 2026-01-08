import { Controller, Get, Query } from "@nestjs/common";
import { OrgService } from "./org.service";

@Controller("org")
export class OrgController {
    constructor(private service: OrgService) { }

    @Get("areas")
    areas() {
        return this.service.areas();
    }

    @Get("direcciones")
    direcciones(@Query("areaId") areaId: string) {
        return this.service.direcciones(Number(areaId));
    }

    @Get("departamentos")
    departamentos(@Query("direccionId") direccionId: string) {
        return this.service.departamentos(Number(direccionId));
    }

    @Get("oficinas")
    oficinas(@Query("departamentoId") departamentoId: string) {
        return this.service.oficinas(Number(departamentoId));
    }

    @Get("secciones-programa")
    seccionesPrograma(@Query("oficinaId") oficinaId: string) {
        return this.service.seccionesPrograma(Number(oficinaId));
    }
}

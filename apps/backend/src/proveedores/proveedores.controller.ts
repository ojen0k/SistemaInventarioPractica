import { Controller, Get, Query } from "@nestjs/common";
import { ProveedoresService } from "./proveedores.service";

@Controller("proveedores")
export class ProveedoresController {
    constructor(private readonly service: ProveedoresService) { }

    @Get("by-rut")
    byRut(@Query("rut") rut: string) {
        return this.service.byRut(rut);
    }
}

import { Controller, Get, Param } from "@nestjs/common";
import { CatalogosService } from "./catalogos.service";
import type { CatalogKey } from "./catalogos.service";

@Controller("catalogos")
export class CatalogosController {
    constructor(private service: CatalogosService) { }

    @Get(":key")
    list(@Param("key") key: CatalogKey) {
        return this.service.list(key);
    }
}

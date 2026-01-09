import { Body, Controller, Post } from "@nestjs/common";
import { ActivosService } from "./activos.service";

@Controller("activos")
export class ActivosController {
    constructor(private readonly service: ActivosService) { }

    @Post()
    create(@Body() body: any) {
        return this.service.create(body);
    }
}

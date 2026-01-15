import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ActivosService } from "./activos.service";

@Controller("activos")
export class ActivosController {
    constructor(private readonly service: ActivosService) { }

    @Post()
    create(@Body() body: any) {
        return this.service.create(body);
    }

    @Get()
    list() {
        return this.service.list();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.service.findOne(Number(id));
    }

    @Delete(":id")
    delete(@Param("id") id: string) {
        return this.service.delete(Number(id));
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() body: any) {
        return this.service.update(Number(id), body);
    }
}

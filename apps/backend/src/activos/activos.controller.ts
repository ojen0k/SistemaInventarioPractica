import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ActivosService } from "./activos.service";
import { JwtAuthGuard } from "../auth/jwt.guard";

@Controller("activos")
export class ActivosController {
    constructor(private readonly service: ActivosService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() body: any, @Req() req: any) {
        const userId = req.user?.sub;
        return this.service.create(body, Number(userId));
    }

    @Get()
    list(@Query() query: any) {
        return this.service.list(query);
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

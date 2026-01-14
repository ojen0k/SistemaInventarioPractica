import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsuariosService } from "./usuarios.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("Administrador")
@Controller("usuarios")
export class UsuariosController {
    constructor(private service: UsuariosService) { }

    @Get()
    list() {
        return this.service.list();
    }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.service.create(dto);
    }
}

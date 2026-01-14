import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) { }

    async list() {
        const rows = await this.prisma.usuario.findMany({
            orderBy: { id_usuario: "asc" },
            select: {
                id_usuario: true,
                nombre_usuario: true,
                correo: true,
                activo: true,
                ultimo_acceso: true,
                creado_en: true,
                roles: {
                    select: { rol: { select: { nombre: true } } },
                },
            },
        });

        return rows.map((u) => ({
            id: u.id_usuario,
            username: u.nombre_usuario,
            correo: u.correo,
            activo: u.activo,
            ultimoAcceso: u.ultimo_acceso,
            creadoEn: u.creado_en,
            roles: u.roles.map((r) => r.rol.nombre),
        }));
    }

    async create(dto: CreateUserDto) {
        const username = dto.username.trim();

        const existing = await this.prisma.usuario.findFirst({
            where: {
                OR: [
                    { nombre_usuario: username },
                    ...(dto.correo ? [{ correo: dto.correo }] : []),
                ],
            },
            select: { id_usuario: true },
        });

        if (existing) {
            throw new BadRequestException("Ya existe un usuario con ese username/correo.");
        }

        // validar roles existentes
        const roles = await this.prisma.rol.findMany({
            where: { nombre: { in: dto.roles } },
            select: { id_rol: true, nombre: true },
        });

        if (roles.length !== dto.roles.length) {
            const found = new Set(roles.map((r) => r.nombre));
            const missing = dto.roles.filter((r) => !found.has(r));
            throw new BadRequestException(`Roles inválidos: ${missing.join(", ")}`);
        }

        const hash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.usuario.create({
            data: {
                nombre_usuario: username,
                correo: dto.correo ?? null,
                hash_contrasena: hash,
                activo: true,
            },
            select: { id_usuario: true, nombre_usuario: true, correo: true, activo: true },
        });

        await this.prisma.usuario_rol.createMany({
            data: roles.map((r) => ({
                id_usuario: user.id_usuario,
                id_rol: r.id_rol,
            })),
        });

        return {
            id: user.id_usuario,
            username: user.nombre_usuario,
            correo: user.correo,
            activo: user.activo,
            roles: dto.roles,
        };
    }
}

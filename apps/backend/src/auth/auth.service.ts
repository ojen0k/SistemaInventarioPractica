import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "./types";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) { }

    /**
     * `username` aquí es el identificador que te llega del front.
     * Lo validamos contra nombre_usuario O correo (si quieres dejarlo así de flexible).
     */
    async login(username: string, password: string) {
        const user = await this.prisma.usuario.findFirst({
            where: {
                activo: true,
                OR: [{ nombre_usuario: username }, { correo: username }],
            },
            include: {
                roles: { include: { rol: true } }, // <- relación correcta en tu schema
            },
        });

        if (!user) throw new UnauthorizedException("Credenciales inválidas");

        const ok = await bcrypt.compare(password, user.hash_contrasena);
        if (!ok) throw new UnauthorizedException("Credenciales inválidas");

        const roles = user.roles.map((ur) => ur.rol.nombre);

        const payload: JwtPayload = {
            sub: user.id_usuario,
            username: user.nombre_usuario,
            roles,
        };

        const accessToken = await this.jwt.signAsync(payload);

        //  registra último acceso
        await this.prisma.usuario.update({
            where: { id_usuario: user.id_usuario },
            data: { ultimo_acceso: new Date() },
        });

        return {
            accessToken,
            user: {
                id: user.id_usuario,
                username: user.nombre_usuario,
                roles,
            },
        };
    }

    async me(userId: number) {
        const user = await this.prisma.usuario.findUnique({
            where: { id_usuario: userId },
            include: { roles: { include: { rol: true } } },
        });

        if (!user) return null;

        return {
            id: user.id_usuario,
            username: user.nombre_usuario,
            roles: user.roles.map((ur) => ur.rol.nombre),
        };
    }
}

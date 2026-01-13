import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
    constructor(private readonly auth: AuthService) { }

    @Post("login")
    login(@Body() body: any) {
        if (!body || typeof body !== "object") {
            throw new BadRequestException("Body JSON faltante (Content-Type: application/json).");
        }
        const { username, password } = body;
        if (!username || !password) {
            throw new BadRequestException("Debes enviar { username, password }.");
        }
        return this.auth.login(username, password);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    me(@Req() req: any) {
        return this.auth.me(req.user.sub);
    }
}

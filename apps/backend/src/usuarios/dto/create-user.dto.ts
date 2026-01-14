import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsOptional()
    @IsEmail()
    correo?: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsArray()
    @IsString({ each: true })
    roles!: string[]; // ["Administrador"] o ["Soporte"]
}

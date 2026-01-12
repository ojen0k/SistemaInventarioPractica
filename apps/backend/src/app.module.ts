import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { CatalogosModule } from './catalogos/catalogos.module';
import { OrgModule } from './org/org.module';
import { ActivosModule } from './activos/activos.module';
import { IpsModule } from './ips/ips.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CatalogosModule,
    OrgModule,
    ActivosModule,
    IpsModule,
    ProveedoresModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

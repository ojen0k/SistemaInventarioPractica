import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ActivosService {
    constructor(private readonly prisma: PrismaService) { }

    async create(form: any) {

        if (!form?.rutProveedor?.trim()) throw new BadRequestException("rutProveedor requerido");
        if (!form?.nombreProveedor?.trim()) throw new BadRequestException("nombreProveedor requerido");
        if (!form?.nombreActivo?.trim()) throw new BadRequestException("nombreActivo requerido");
        if (!form?.estadoId) throw new BadRequestException("estadoId requerido");


        const defaultTipo = await this.prisma.tipo_activo.findFirst({
            where: { activo: true },
            orderBy: { id_tipo_activo: "asc" },
        });
        if (!defaultTipo) {
            throw new BadRequestException(
                "No existe tipo_activo. Crea al menos 1 registro en tipo_activo (ej: 'General')."
            );
        }

        const anio = form?.anio ? Number(form.anio) : null;

        return this.prisma.$transaction(async (tx) => {
            // 1) proveedor upsert por rut
            const proveedor = await tx.proveedor.upsert({
                where: { rut_proveedor: form.rutProveedor.trim() },
                update: {
                    nombre_proveedor: form.nombreProveedor.trim(),
                    activo: true,
                },
                create: {
                    rut_proveedor: form.rutProveedor.trim(),
                    nombre_proveedor: form.nombreProveedor.trim(),
                    activo: true,
                },
            });

            // 2) compra
            const compra = await tx.compra.create({
                data: {
                    orden_compra: form.ordenCompra?.trim() || null,
                    numero_factura: form.numeroFactura?.trim() || null,
                    anio,
                    id_tipo_adquisicion: form.tipoAdquisicionId ? Number(form.tipoAdquisicionId) : null,
                    id_modalidad: form.modalidadId ? Number(form.modalidadId) : null,
                    id_proveedor: proveedor.id_proveedor,
                },
            });

            // 3) activo
            const detalles = {
                pc: {
                    procesador: form.procesador || null,
                    memoria: form.memoria || null,
                    almacenamiento: form.almacenamiento || null,
                    placaMadre: form.placaMadre || null,
                    fuentePoder: form.fuentePoder || null,
                },
            };

            const activo = await tx.activo.create({
                data: {
                    id_tipo_activo: defaultTipo.id_tipo_activo,
                    id_compra: compra.id_compra,

                    producto: form.nombreActivo?.trim() || null,
                    marca: form.marca?.trim() || null,
                    modelo: form.modelo?.trim() || null,
                    numero_serie: form.serialNumber?.trim() || null,

                    id_clasificacion_activo: form.clasificacionId ? Number(form.clasificacionId) : null,
                    id_estado_activo: Number(form.estadoId),

                    observacion: form.observacionActivo?.trim() || null,
                    detalles_json: JSON.stringify(detalles),
                },
            });

            // 4) asignación (DB guarda solo seccion_programa?)
            await tx.asignacion_activo.create({
                data: {
                    id_activo: activo.id_activo,
                    id_seccion_programa: form.seccionProgramaId ? Number(form.seccionProgramaId) : null,
                    ubicacion_interna: form.ubicacionTexto?.trim() || null,

                    nombre_responsable: form.responsableNombre?.trim() || null,
                    id_cargo_responsable: form.cargoId ? Number(form.cargoId) : null,

                    id_tipo_asignacion: form.tipoAsignacionId ? Number(form.tipoAsignacionId) : null,
                    fecha_asignacion: form.fechaAsignacion ? new Date(form.fechaAsignacion) : null,

                    observaciones: form.observacionAsignacion?.trim() || null,
                },
            });

            // 5) RED/IP (opcional)
            const hasNet = (form.macLan && String(form.macLan).trim()) ||
                (form.macWifi && String(form.macWifi).trim()) ||
                (form.ip && String(form.ip).trim());

            if (hasNet) {
                const iface = await tx.interfaz_red.create({
                    data: {
                        id_activo: activo.id_activo,
                        mac_ethernet: form.macLan?.trim() || null,
                        mac_wireless: form.macWifi?.trim() || null,
                        host: null,
                    },
                });

                const ipText = form.ip?.trim();
                if (ipText) {
                    // buscar estados por nombre (evita depender de IDs fijos)
                    const estadosIp = await tx.cat_estado_ip.findMany({
                        select: { id_estado_ip: true, nombre: true },
                    });

                    const findEstado = (needle: string) =>
                        estadosIp.find((e) => (e.nombre ?? "").toLowerCase().includes(needle));

                    const estadoAsignado = findEstado("asign");
                    const estadoDisponible = findEstado("dispon");


                    if (!estadoAsignado) {
                        throw new BadRequestException("No existe cat_estado_ip 'Asignado' (o similar).");
                    }

                    const ipRow = await tx.ip_recurso.findUnique({ where: { ip: ipText } });

                    // si existe y está asignada -> bloquear
                    if (ipRow && estadoDisponible && ipRow.id_estado_ip !== estadoDisponible.id_estado_ip) {

                        throw new BadRequestException(`La IP ${ipText} ya está asignada.`);
                    }

                    // crear o actualizar a Asignado
                    const ip = await tx.ip_recurso.upsert({
                        where: { ip: ipText },
                        update: { id_estado_ip: estadoAsignado.id_estado_ip },
                        create: { ip: ipText, id_estado_ip: estadoAsignado.id_estado_ip },
                    });

                    await tx.interfaz_ip.create({
                        data: {
                            id_interfaz_red: iface.id_interfaz_red,
                            id_ip_recurso: ip.id_ip_recurso,
                            fecha_asignacion: new Date(),
                        },
                    });
                }
            }

            return {
                ok: true,
                id_activo: activo.id_activo,
                id_compra: compra.id_compra,
                id_proveedor: proveedor.id_proveedor,
            };
        });
    }
}

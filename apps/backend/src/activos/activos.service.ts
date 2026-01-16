import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ActivosService {
    constructor(private readonly prisma: PrismaService) { }

    async create(form: any, userId?: number) {

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
                    id_usuario_creador: userId || null,

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
    // Listar activos con filtros
    async list(params: any = {}) {
        const {
            q,
            tags, // string "tag1,tag2" or string[]
            estadoId,
            clasificacionId,
            areaId,
            direccionId,
            departamentoId,
            oficinaId,
            seccionId,
            creadoPorId, // para filtrar "Mis activos"
        } = params;

        const where: any = {};

        // 1. Filtros directos
        if (estadoId) where.id_estado_activo = Number(estadoId);
        if (clasificacionId) where.id_clasificacion_activo = Number(clasificacionId);
        if (creadoPorId) where.id_usuario_creador = Number(creadoPorId);

        // 2. Jerarquía (cascade)
        if (seccionId) {
            where.asignaciones = { some: { id_seccion_programa: Number(seccionId) } };
        } else if (oficinaId) {
            where.asignaciones = { some: { seccion_programa: { id_oficina: Number(oficinaId) } } };
        } else if (departamentoId) {
            where.asignaciones = { some: { seccion_programa: { oficina: { id_departamento: Number(departamentoId) } } } };
        } else if (direccionId) {
            where.asignaciones = { some: { seccion_programa: { oficina: { departamento: { id_direccion: Number(direccionId) } } } } };
        } else if (areaId) {
            where.asignaciones = { some: { seccion_programa: { oficina: { departamento: { direccion: { id_area: Number(areaId) } } } } } };
        }

        // 3. Búsqueda Texto / Tags
        // Unifica 'q' (busqueda simple) y 'tags' (busqueda múltiple)
        const terms: string[] = [];
        if (q && typeof q === 'string') terms.push(q);
        if (tags) {
            if (Array.isArray(tags)) terms.push(...tags);
            else if (typeof tags === 'string') terms.push(...tags.split(','));
        }

        if (terms.length > 0) {
            // AND implícito entre tags: El activo debe cumplir (Tag1) AND (Tag2)
            // Cada Tag es un OR interno (match nombre OR modelo OR serial...)
            where.AND = terms.map((t) => {
                const term = t.trim();
                return {
                    OR: [
                        { producto: { contains: term } }, // SqlServer default collation usually CI
                        { marca: { contains: term } },
                        { modelo: { contains: term } },
                        { numero_serie: { contains: term } },
                        { descripcion: { contains: term } },

                        { asignaciones: { some: { nombre_responsable: { contains: term } } } },
                        { asignaciones: { some: { rut_responsable: { contains: term } } } },
                        { interfaces_red: { some: { interfaz_ip: { ip_recurso: { ip: { contains: term } } } } } },
                        { compra: { orden_compra: { contains: term } } }
                    ]
                };
            });
        }

        const rows = await this.prisma.activo.findMany({
            where,
            orderBy: { id_activo: "desc" },
            take: 200,
            select: {
                id_activo: true,
                producto: true,
                marca: true,
                modelo: true,
                numero_serie: true,
                descripcion: true,
                creado_en: true,

                // nombres reales de relaciones
                estado_activo: { select: { nombre: true } },
                clasificacion_activo: { select: { nombre: true } },
                usuario_creador: { select: { nombre_usuario: true } },

                compra: {
                    select: {
                        orden_compra: true,
                        anio: true,
                        proveedor: { select: { rut_proveedor: true, nombre_proveedor: true } },
                    },
                },

                asignaciones: {
                    take: 1,
                    orderBy: { id_asignacion_activo: "desc" },
                    select: {
                        nombre_responsable: true,
                        ubicacion_interna: true,
                        fecha_asignacion: true,
                        seccion_programa: { select: { nombre: true } },
                    },
                },
                interfaces_red: {
                    take: 1,
                    include: {
                        interfaz_ip: {
                            include: {
                                ip_recurso: { select: { ip: true } },
                            },
                        },
                    },
                },
            },
        });

        return rows.map((a) => ({
            id: a.id_activo,
            producto: a.producto ?? null,
            marca: a.marca ?? null,
            modelo: a.modelo ?? null,
            serie: a.numero_serie ?? null,
            descripcion: a.descripcion ?? null,

            ip: a.interfaces_red?.[0]?.interfaz_ip?.ip_recurso?.ip ?? null,

            estado: a.estado_activo?.nombre ?? null,
            clasificacion: a.clasificacion_activo?.nombre ?? null,

            oc: a.compra?.orden_compra ?? null,
            anio: a.compra?.anio ?? null,
            proveedorRut: a.compra?.proveedor?.rut_proveedor ?? null,
            proveedorNombre: a.compra?.proveedor?.nombre_proveedor ?? null,

            responsable: a.asignaciones?.[0]?.nombre_responsable ?? null,
            ubicacion: a.asignaciones?.[0]?.ubicacion_interna ?? null,
            seccion: a.asignaciones?.[0]?.seccion_programa?.nombre ?? null,
            fechaAsignacion: a.asignaciones?.[0]?.fecha_asignacion ?? null,

            fechaRegistro: a.creado_en,
            creadoPor: a.usuario_creador?.nombre_usuario ?? null,
        }));
    }

    // Buscar uno completo para editar
    async findOne(id: number) {
        return this.prisma.activo.findUnique({
            where: { id_activo: id },
            include: {
                compra: {
                    include: {
                        proveedor: true,
                    },
                },
                clasificacion_activo: true,
                estado_activo: true,
                asignaciones: {
                    orderBy: { id_asignacion_activo: 'desc' },
                    take: 1,
                    include: {
                        seccion_programa: true,
                    },
                },
                interfaces_red: {
                    include: {
                        interfaz_ip: {
                            include: {
                                ip_recurso: true,
                            },
                        },
                    },
                },
            },
        });
    }

    // Actualizar activo
    async update(id: number, form: any) {
        if (!form?.rutProveedor?.trim()) throw new BadRequestException("rutProveedor requerido");
        if (!form?.nombreProveedor?.trim()) throw new BadRequestException("nombreProveedor requerido");
        if (!form?.nombreActivo?.trim()) throw new BadRequestException("nombreActivo requerido");

        const anio = form?.anio ? Number(form.anio) : null;

        return this.prisma.$transaction(async (tx) => {
            // 1. Validar existencia
            const current = await tx.activo.findUnique({ where: { id_activo: id }, include: { compra: true } });
            if (!current) throw new BadRequestException("Activo no encontrado");

            // 2. Actualizar Proveedor
            const proveedor = await tx.proveedor.upsert({
                where: { rut_proveedor: form.rutProveedor.trim() },
                update: { nombre_proveedor: form.nombreProveedor.trim() },
                create: {
                    rut_proveedor: form.rutProveedor.trim(),
                    nombre_proveedor: form.nombreProveedor.trim(),
                    activo: true,
                },
            });

            // 3. Actualizar Compra (si existe la relación)
            if (current.id_compra) {
                await tx.compra.update({
                    where: { id_compra: current.id_compra },
                    data: {
                        orden_compra: form.ordenCompra?.trim() || null,
                        numero_factura: form.numeroFactura?.trim() || null,
                        anio,
                        id_tipo_adquisicion: form.tipoAdquisicionId ? Number(form.tipoAdquisicionId) : null,
                        id_modalidad: form.modalidadId ? Number(form.modalidadId) : null,
                        id_proveedor: proveedor.id_proveedor,
                    },
                });
            }

            // 4. Actualizar Activo
            const detalles = {
                pc: {
                    procesador: form.procesador || null,
                    memoria: form.memoria || null,
                    almacenamiento: form.almacenamiento || null,
                    placaMadre: form.placaMadre || null,
                    fuentePoder: form.fuentePoder || null,
                },
            };

            await tx.activo.update({
                where: { id_activo: id },
                data: {
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

            // 5. Asignación: Actualizamos la ULTIMA asignación o creamos una nueva si cambió mucho?
            // Para simplificar: Actualizamos la asignación más reciente si existe, sino creamos.
            const lastAsig = await tx.asignacion_activo.findFirst({
                where: { id_activo: id },
                orderBy: { id_asignacion_activo: 'desc' },
            });

            if (lastAsig) {
                await tx.asignacion_activo.update({
                    where: { id_asignacion_activo: lastAsig.id_asignacion_activo },
                    data: {
                        id_seccion_programa: form.seccionProgramaId ? Number(form.seccionProgramaId) : null,
                        ubicacion_interna: form.ubicacionTexto?.trim() || null,
                        nombre_responsable: form.responsableNombre?.trim() || null,
                        id_cargo_responsable: form.cargoId ? Number(form.cargoId) : null,
                        id_tipo_asignacion: form.tipoAsignacionId ? Number(form.tipoAsignacionId) : null,
                        fecha_asignacion: form.fechaAsignacion ? new Date(form.fechaAsignacion) : null,
                        observaciones: form.observacionAsignacion?.trim() || null,
                    },
                });
            } else {
                // Si por alguna razón no tenía, creamos una
                await tx.asignacion_activo.create({
                    data: {
                        id_activo: id,
                        id_seccion_programa: form.seccionProgramaId ? Number(form.seccionProgramaId) : null,
                        ubicacion_interna: form.ubicacionTexto?.trim() || null,
                        nombre_responsable: form.responsableNombre?.trim() || null,
                        id_cargo_responsable: form.cargoId ? Number(form.cargoId) : null,
                        id_tipo_asignacion: form.tipoAsignacionId ? Number(form.tipoAsignacionId) : null,
                        fecha_asignacion: form.fechaAsignacion ? new Date(form.fechaAsignacion) : null,
                        observaciones: form.observacionAsignacion?.trim() || null,
                    },
                });
            }

            // 6. Interfaces Red (Simplificación: Borrar y Recrear si hay cambios de IP/MAC podría ser drástico)
            // Mejor: Buscar la Interfaz principal y actualizarla.
            const interfaces = await tx.interfaz_red.findMany({ where: { id_activo: id } });
            let ifaceId = interfaces[0]?.id_interfaz_red;

            if (!ifaceId) {
                // Crear si no existe
                const newIface = await tx.interfaz_red.create({
                    data: {
                        id_activo: id,
                        mac_ethernet: form.macLan?.trim() || null,
                        mac_wireless: form.macWifi?.trim() || null,
                    },
                });
                ifaceId = newIface.id_interfaz_red;
            } else {
                await tx.interfaz_red.update({
                    where: { id_interfaz_red: ifaceId },
                    data: {
                        mac_ethernet: form.macLan?.trim() || null,
                        mac_wireless: form.macWifi?.trim() || null,
                    },
                });
            }

            // IP Logic (Complejo, reutilizar logica de create seria ideal pero por ahora update simple)
            const ipText = form.ip?.trim();
            if (ipText) {
                // ... Simplificación para update: asume que si cambia la IP, hay que liberar la anterior y asignar la nueva.
                // Esto es complejo. Dejémoslo básico: Intentar asignar la nueva IP.
                // TODO: Logic completa de IP release/attach.
            }

            return { ok: true, id };
        });
    }

    //Borrar activo
    async delete(id: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Borrar dependencias (tablas que apuntan a activo)
            // Asignaciones
            await tx.asignacion_activo.deleteMany({ where: { id_activo: id } });
            // Préstamos
            await tx.prestamo.deleteMany({ where: { id_activo: id } });
            // Interfaces de red
            // Primero borrar la relación interfaz_ip
            const interfaces = await tx.interfaz_red.findMany({ where: { id_activo: id }, select: { id_interfaz_red: true } });
            const idsInterfaces = interfaces.map(i => i.id_interfaz_red);
            if (idsInterfaces.length > 0) {
                await tx.interfaz_ip.deleteMany({ where: { id_interfaz_red: { in: idsInterfaces } } });
                await tx.interfaz_red.deleteMany({ where: { id_activo: id } });
            }

            // 2. Borrar el activo
            const deleted = await tx.activo.delete({
                where: { id_activo: id },
            });

            return deleted;
        });
    }
}



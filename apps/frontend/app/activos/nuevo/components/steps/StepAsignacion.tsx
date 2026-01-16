import { useEffect, useState } from "react";
import type { CatalogItem, FormState } from "../../lib/types";
import { orgApi, type OrgItem } from "../../lib/org";
import { Field } from "../Field";

export function StepAsignacion({
    form,
    set,
    loading,
    cargos,
    tiposAsignacion,
}: {
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
    loading: boolean;
    cargos: CatalogItem[];
    tiposAsignacion: CatalogItem[];
}) {
    const [areas, setAreas] = useState<OrgItem[]>([]);
    const [direcciones, setDirecciones] = useState<OrgItem[]>([]);
    const [departamentos, setDepartamentos] = useState<OrgItem[]>([]);
    const [oficinas, setOficinas] = useState<OrgItem[]>([]);
    const [secciones, setSecciones] = useState<OrgItem[]>([]);

    const [loadingOrg, setLoadingOrg] = useState(false);
    const [errorOrg, setErrorOrg] = useState<string | null>(null);

    // Load áreas al entrar al step
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                setLoadingOrg(true);
                setErrorOrg(null);
                const a = await orgApi.areas();
                if (!cancelled) setAreas(a);
            } catch (e: any) {
                if (!cancelled) setErrorOrg(e?.message ?? "Error cargando áreas");
            } finally {
                if (!cancelled) setLoadingOrg(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Cascada: cuando cambia área, carga direcciones
    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!form.areaId) {
                setDirecciones([]);
                setDepartamentos([]);
                setOficinas([]);
                setSecciones([]);
                return;
            }
            try {
                setLoadingOrg(true);
                setErrorOrg(null);
                const d = await orgApi.direcciones(form.areaId);
                if (!cancelled) setDirecciones(d);
            } catch (e: any) {
                if (!cancelled) setErrorOrg(e?.message ?? "Error cargando direcciones");
            } finally {
                if (!cancelled) setLoadingOrg(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [form.areaId]);

    // Cascada: cuando cambia dirección, carga departamentos
    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!form.direccionId) {
                setDepartamentos([]);
                setOficinas([]);
                setSecciones([]);
                return;
            }
            try {
                setLoadingOrg(true);
                setErrorOrg(null);
                const dep = await orgApi.departamentos(form.direccionId);
                if (!cancelled) setDepartamentos(dep);
            } catch (e: any) {
                if (!cancelled) setErrorOrg(e?.message ?? "Error cargando departamentos");
            } finally {
                if (!cancelled) setLoadingOrg(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [form.direccionId]);

    // Cascada: cuando cambia departamento, carga oficinas
    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!form.departamentoId) {
                setOficinas([]);
                setSecciones([]);
                return;
            }
            try {
                setLoadingOrg(true);
                setErrorOrg(null);
                const o = await orgApi.oficinas(form.departamentoId);
                if (!cancelled) setOficinas(o);
            } catch (e: any) {
                if (!cancelled) setErrorOrg(e?.message ?? "Error cargando oficinas");
            } finally {
                if (!cancelled) setLoadingOrg(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [form.departamentoId]);

    // Cascada: cuando cambia oficina, carga secciones/programas
    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!form.oficinaId) {
                setSecciones([]);
                return;
            }
            try {
                setLoadingOrg(true);
                setErrorOrg(null);
                const s = await orgApi.seccionesPrograma(form.oficinaId);
                if (!cancelled) setSecciones(s);
            } catch (e: any) {
                if (!cancelled) setErrorOrg(e?.message ?? "Error cargando secciones/programas");
            } finally {
                if (!cancelled) setLoadingOrg(false);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [form.oficinaId]);

    // Cambios manuales
    function changeArea(v: string) {
        set("areaId", v);
        set("direccionId", "");
        set("departamentoId", "");
        set("oficinaId", "");
        set("seccionProgramaId", "");
    }
    function changeDireccion(v: string) {
        set("direccionId", v);
        set("departamentoId", "");
        set("oficinaId", "");
        set("seccionProgramaId", "");
    }
    function changeDepartamento(v: string) {
        set("departamentoId", v);
        set("oficinaId", "");
        set("seccionProgramaId", "");
    }
    function changeOficina(v: string) {
        set("oficinaId", v);
        set("seccionProgramaId", "");
    }

    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold">Asignación</h2>

            {errorOrg && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
                    <div className="font-medium">Error unidad organizacional</div>
                    <div>{errorOrg}</div>
                </div>
            )}

            <div className="flex gap-4">
                <div className="w-full">
                    <Field label="Área">
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={form.areaId}
                            onChange={(e) => changeArea(e.target.value)}
                            disabled={loadingOrg}
                        >
                            <option value="">Seleccione...</option>
                            {areas.map((x) => (
                                <option key={x.id} value={x.id}>{x.nombre}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Dirección">
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={form.direccionId}
                            onChange={(e) => changeDireccion(e.target.value)}
                            disabled={!form.areaId || loadingOrg}
                        >
                            <option value="">Seleccione...</option>
                            {direcciones.map((x) => (
                                <option key={x.id} value={x.id}>{x.nombre}</option>
                            ))}
                        </select>
                    </Field>


                    <Field label="Departamento">
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={form.departamentoId}
                            onChange={(e) => changeDepartamento(e.target.value)}
                            disabled={!form.direccionId || loadingOrg}
                        >
                            <option value="">Seleccione...</option>
                            {departamentos.map((x) => (
                                <option key={x.id} value={x.id}>{x.nombre}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Oficina">
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={form.oficinaId}
                            onChange={(e) => changeOficina(e.target.value)}
                            disabled={!form.departamentoId || loadingOrg}
                        >
                            <option value="">Seleccione...</option>
                            {oficinas.map((x) => (
                                <option key={x.id} value={x.id}>{x.nombre}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Sección / Programa">
                        <select
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            value={form.seccionProgramaId}
                            onChange={(e) => set("seccionProgramaId", e.target.value)}
                            disabled={!form.oficinaId || loadingOrg}
                        >
                            <option value="">Seleccione...</option>
                            {secciones.map((x) => (
                                <option key={x.id} value={x.id}>{x.nombre}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div className="w-full">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Nombre responsable">
                            <input
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={form.responsableNombre}
                                onChange={(e) => set("responsableNombre", e.target.value)}
                            />
                        </Field>

                        <Field label="Cargo">
                            <select
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={form.cargoId}
                                onChange={(e) => set("cargoId", e.target.value)}
                                disabled={loading || cargos.length === 0}
                            >
                                {cargos.map((x) => (
                                    <option key={x.id} value={x.id}>{x.nombre}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Fecha asignación">
                            <input
                                type="date"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={form.fechaAsignacion}
                                onChange={(e) => set("fechaAsignacion", e.target.value)}
                            />
                        </Field>

                        <Field label="Tipo de asignación">
                            <select
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={form.tipoAsignacionId}
                                onChange={(e) => set("tipoAsignacionId", e.target.value)}
                                disabled={loading || tiposAsignacion.length === 0}
                            >
                                {tiposAsignacion.map((x) => (
                                    <option key={x.id} value={x.id}>{x.nombre}</option>
                                ))}
                            </select>
                        </Field>



                    </div>

                    <div className="mt-4">
                        <Field label="Observación (opcional)">
                            <textarea
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={form.observacionAsignacion}
                                onChange={(e) => set("observacionAsignacion", e.target.value)}
                                rows={3}
                            />
                        </Field>
                    </div>
                </div>
            </div>
        </div>
    );
}

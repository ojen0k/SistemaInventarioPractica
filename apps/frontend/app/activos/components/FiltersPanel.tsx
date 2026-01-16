"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { orgApi, type OrgItem } from "../nuevo/lib/org";
import { fetchCatalog } from "../nuevo/lib/catalogos";
import type { CatalogItem } from "../nuevo/lib/types";

export type FilterState = {
    estadoId: string;
    clasificacionId: string;
    areaId: string;
    direccionId: string;
    departamentoId: string;
    oficinaId: string;
    seccionId: string;
};

interface Props {
    open: boolean;
    onClose: () => void;
    filters: FilterState;
    onChange: (newFilters: FilterState) => void;
}

export function FiltersPanel({ open, onClose, filters, onChange }: Props) {
    // Catálogos simples
    const [estados, setEstados] = useState<CatalogItem[]>([]);
    const [clasificaciones, setClasificaciones] = useState<CatalogItem[]>([]);

    // Org Hierarchy
    const [areas, setAreas] = useState<OrgItem[]>([]);
    const [direcciones, setDirecciones] = useState<OrgItem[]>([]);
    const [departamentos, setDepartamentos] = useState<OrgItem[]>([]);
    const [oficinas, setOficinas] = useState<OrgItem[]>([]);
    const [secciones, setSecciones] = useState<OrgItem[]>([]);

    const [loading, setLoading] = useState(false);

    // Carga inicial
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [e, c, a] = await Promise.all([
                    fetchCatalog("estado-activo"),
                    fetchCatalog("clasificacion-activo"),
                    orgApi.areas(),
                ]);
                setEstados(e);
                setClasificaciones(c);
                setAreas(a);
            } catch (error) {
                console.error("Error loading catalogs", error);
            } finally {
                setLoading(false);
            }
        }
        if (open) load();
    }, [open]);

    // Cascada Org
    useEffect(() => {
        if (!filters.areaId) {
            setDirecciones([]);
            return;
        }
        orgApi.direcciones(filters.areaId).then(setDirecciones);
    }, [filters.areaId]);

    useEffect(() => {
        if (!filters.direccionId) {
            setDepartamentos([]);
            return;
        }
        orgApi.departamentos(filters.direccionId).then(setDepartamentos);
    }, [filters.direccionId]);

    useEffect(() => {
        if (!filters.departamentoId) {
            setOficinas([]);
            return;
        }
        orgApi.oficinas(filters.departamentoId).then(setOficinas);
    }, [filters.departamentoId]);

    useEffect(() => {
        if (!filters.oficinaId) {
            setSecciones([]);
            return;
        }
        orgApi.seccionesPrograma(filters.oficinaId).then(setSecciones);
    }, [filters.oficinaId]);


    // Handlers
    const set = (key: keyof FilterState, val: string) => {
        const next = { ...filters, [key]: val };

        // Reset children on parent change
        if (key === 'areaId') {
            next.direccionId = ""; next.departamentoId = ""; next.oficinaId = ""; next.seccionId = "";
        }
        if (key === 'direccionId') {
            next.departamentoId = ""; next.oficinaId = ""; next.seccionId = "";
        }
        if (key === 'departamentoId') {
            next.oficinaId = ""; next.seccionId = "";
        }
        if (key === 'oficinaId') {
            next.seccionId = "";
        }

        onChange(next);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-white shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                    <X size={20} />
                </button>
            </div>

            <div className="space-y-6">
                {/* General */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">General</h3>

                    <div>
                        <label className="text-sm block mb-1">Estado</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.estadoId}
                            onChange={e => set('estadoId', e.target.value)}
                        >
                            <option value="">Todos</option>
                            {estados.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Clasificación</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.clasificacionId}
                            onChange={e => set('clasificacionId', e.target.value)}
                        >
                            <option value="">Todas</option>
                            {clasificaciones.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* Ubicación */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ubicación / Org</h3>

                    <div>
                        <label className="text-sm block mb-1">Área</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.areaId}
                            onChange={e => set('areaId', e.target.value)}
                        >
                            <option value="">Todas</option>
                            {areas.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Dirección</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.direccionId}
                            onChange={e => set('direccionId', e.target.value)}
                            disabled={!filters.areaId}
                        >
                            <option value="">Todas</option>
                            {direcciones.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Departamento</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.departamentoId}
                            onChange={e => set('departamentoId', e.target.value)}
                            disabled={!filters.direccionId}
                        >
                            <option value="">Todos</option>
                            {departamentos.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Oficina</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.oficinaId}
                            onChange={e => set('oficinaId', e.target.value)}
                            disabled={!filters.departamentoId}
                        >
                            <option value="">Todas</option>
                            {oficinas.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm block mb-1">Sección</label>
                        <select
                            className="w-full border rounded p-2 text-sm"
                            value={filters.seccionId}
                            onChange={e => set('seccionId', e.target.value)}
                            disabled={!filters.oficinaId}
                        >
                            <option value="">Todas</option>
                            {secciones.map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button
                        onClick={() => onChange({
                            estadoId: "", clasificacionId: "",
                            areaId: "", direccionId: "", departamentoId: "", oficinaId: "", seccionId: ""
                        })}
                        className="w-full py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </div>
    );
}

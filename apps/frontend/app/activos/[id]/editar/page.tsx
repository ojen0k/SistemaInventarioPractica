"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "../../../lib/useRequireAuth";

// Ajustar imports para reutilizar componentes de "nuevo"
import type { FormState, Step } from "../../nuevo/lib/types";
import { fetchCatalog } from "../../nuevo/lib/catalogos";
import { StepHeader } from "../../nuevo/components/StepHeader";
import { StepNav } from "../../nuevo/components/StepNav";
import { StepCompra } from "../../nuevo/components/steps/StepCompra";
import { StepInventario } from "../../nuevo/components/steps/StepInventario";
import { StepPcSpecs } from "../../nuevo/components/steps/StepPCSpecs";
import { StepAsignacion } from "../../nuevo/components/steps/StepAsignacion";

export default function EditarActivoPage() {
    //Hooks
    const router = useRouter();
    const { id } = useParams(); // Obtener ID de la URL
    const token = useRequireAuth();

    //Estado de la página
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(true); // Loading general (catálogos + data)
    const [error, setError] = useState<string | null>(null);

    // Catálogos
    const [tipoAdquisicion, setTipoAdquisicion] = useState<any[]>([]);
    const [modalidades, setModalidades] = useState<any[]>([]);
    const [clasificaciones, setClasificaciones] = useState<any[]>([]);
    const [estados, setEstados] = useState<any[]>([]);
    const [cargos, setCargos] = useState<any[]>([]);
    const [tiposAsignacion, setTiposAsignacion] = useState<any[]>([]);

    // Estado de guardado
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveOk, setSaveOk] = useState<any>(null);

    const [form, setForm] = useState<FormState>({
        ordenCompra: "",
        tipoAdquisicionId: "",
        modalidadId: "",
        numeroFactura: "",
        rutProveedor: "",
        nombreProveedor: "",
        anio: String(new Date().getFullYear()),

        clasificacionId: "",
        nombreActivo: "",
        marca: "",
        modelo: "",
        serialNumber: "",
        estadoId: "",
        ubicacionTexto: "",
        observacionActivo: "",

        procesador: "",
        memoria: "",
        almacenamiento: "",
        placaMadre: "",
        fuentePoder: "",
        macLan: "",
        macWifi: "",
        ip: "",

        areaId: "",
        direccionId: "",
        departamentoId: "",
        oficinaId: "",
        seccionProgramaId: "",
        responsableNombre: "",
        cargoId: "",
        fechaAsignacion: "",
        tipoAsignacionId: "",
        observacionAsignacion: "",

        ipDisponible: null,
    });

    function set<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    const active = (arr: any[]) => arr; // Mostrar todos en edición, incluso inactivos si ya están asignados

    useEffect(() => {
        if (!token || !id) return;

        let cancelled = false;

        async function loadAll() {
            try {
                setLoading(true);
                setError(null);

                const API = process.env.NEXT_PUBLIC_API_URL;

                // 1. Cargar catálogos y datos del activo en paralelo
                const [ta, mo, cl, es, ca, tAsig, assetRes] = await Promise.all([
                    fetchCatalog("tipo-adquisicion"),
                    fetchCatalog("modalidad"),
                    fetchCatalog("clasificacion-activo"),
                    fetchCatalog("estado-activo"),
                    fetchCatalog("cargo"),
                    fetchCatalog("tipo-asignacion"),
                    fetch(`${API}/activos/${id}`),
                ]);

                if (cancelled) return;

                if (!assetRes.ok) throw new Error("No se pudo cargar el activo");
                const asset = await assetRes.json();

                // 2. Setear catálogos
                setTipoAdquisicion(ta);
                setModalidades(mo);
                setClasificaciones(cl);
                setEstados(es);
                setCargos(ca);
                setTiposAsignacion(tAsig);

                // 3. Mapear datos al Form
                const detalles = asset.detalles_json ? JSON.parse(asset.detalles_json) : {};
                const asignacion = asset.asignaciones?.[0] || {};
                const compra = asset.compra || {};
                const proveedor = compra.proveedor || {};
                const iface = asset.interfaces_red?.[0] || {};
                const ifaceIp = iface.interfaces_ip?.[0] || {}; // Ojo con plural/singular del backend response
                // En backend findOne devolvimos 'interfaces_ip' en singular 'interfaz_ip' dentro de interfaces_red? 
                // Revisé ActivosService: interfaz_re tiene 'interfaz_ip' (singular relation). 
                // Pero backend response structure depende de prisma result.
                // findUnique include interfaces_red -> include interfaz_ip.
                // Entonces asset.interfaces_red[0].interfaz_ip
                const ipRecurso = asset.interfaces_red?.[0]?.interfaz_ip?.ip_recurso || {};

                setForm({
                    ordenCompra: compra.orden_compra || "",
                    tipoAdquisicionId: compra.id_tipo_adquisicion?.toString() || "",
                    modalidadId: compra.id_modalidad?.toString() || "",
                    numeroFactura: compra.numero_factura || "",
                    rutProveedor: proveedor.rut_proveedor || "",
                    nombreProveedor: proveedor.nombre_proveedor || "",
                    anio: compra.anio?.toString() || "",

                    clasificacionId: asset.id_clasificacion_activo?.toString() || "",
                    nombreActivo: asset.producto || "",
                    marca: asset.marca || "",
                    modelo: asset.modelo || "",
                    serialNumber: asset.numero_serie || "",
                    estadoId: asset.id_estado_activo?.toString() || "",
                    ubicacionTexto: asignacion.ubicacion_interna || "",
                    observacionActivo: asset.observacion || "",

                    procesador: detalles.pc?.procesador || "",
                    memoria: detalles.pc?.memoria || "",
                    almacenamiento: detalles.pc?.almacenamiento || "",
                    placaMadre: detalles.pc?.placaMadre || "",
                    fuentePoder: detalles.pc?.fuentePoder || "",

                    macLan: iface.mac_ethernet || "",
                    macWifi: iface.mac_wireless || "",
                    ip: ipRecurso.ip || "",


                    areaId: "",
                    direccionId: "",
                    departamentoId: "",
                    oficinaId: "",
                    seccionProgramaId: asignacion.id_seccion_programa?.toString() || "",

                    responsableNombre: asignacion.nombre_responsable || "",
                    cargoId: asignacion.id_cargo_responsable?.toString() || "",
                    fechaAsignacion: asignacion.fecha_asignacion ? asignacion.fecha_asignacion.split('T')[0] : "",
                    tipoAsignacionId: asignacion.id_tipo_asignacion?.toString() || "",
                    observacionAsignacion: asignacion.observaciones || "",

                    ipDisponible: true, // Asumimos válido al cargar
                });

            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Error cargando datos");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadAll();
        return () => {
            cancelled = true;
        };
    }, [token, id]);

    const clasificacionNombre = useMemo(() => {
        const found = clasificaciones.find((c) => c.id === form.clasificacionId);
        return (found?.nombre ?? "").toLowerCase();
    }, [clasificaciones, form.clasificacionId]);

    const needsPcSpecs = useMemo(() => clasificacionNombre.includes("comput"), [clasificacionNombre]);

    if (!token) return null;

    function validateStep(s: Step): string | null {
        // Misma validación que en nuevo
        if (s === 1) {
            if (!form.ordenCompra.trim()) return "Orden de compra es obligatoria.";
            if (!form.rutProveedor.trim()) return "RUT proveedor es obligatorio.";
            if (!form.nombreProveedor.trim()) return "Nombre proveedor es obligatorio.";
            return null;
        }
        if (s === 2) {
            if (!form.nombreActivo.trim()) return "Nombre del activo es obligatorio.";
            return null;
        }
        if (s === 3) {
            if (!needsPcSpecs) return null;
            // Para editar, relajamos validación IP si es la misma? 
            // Por simplicidad mantenemos igual, el usuario sabrá si cambia IP.
            return null;
        }
        if (s === 4) {
            // Seccion es obligatoria
            if (!form.seccionProgramaId) return "Selecciona Sección/Programa.";
            if (!form.responsableNombre.trim()) return "Nombre responsable es obligatorio.";
            if (!form.cargoId) return "Selecciona cargo.";
            return null;
        }
        return null;
    }

    const stepError = validateStep(step);

    function next() {
        if (step === 2) {
            setStep(needsPcSpecs ? 3 : 4);
            return;
        }
        if (step < 4) setStep((step + 1) as Step);
    }

    function back() {
        if (step === 4) {
            setStep(needsPcSpecs ? 3 : 2);
            return;
        }
        if (step > 1) setStep((step - 1) as Step);
    }

    async function onSave() {
        setSaving(true);
        setSaveError(null);
        setSaveOk(null);

        try {
            const API = process.env.NEXT_PUBLIC_API_URL;
            // PATCH request
            const res = await fetch(`${API}/activos/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                const msg = data?.message
                    ? Array.isArray(data.message)
                        ? data.message.join(" | ")
                        : String(data.message)
                    : `Error HTTP ${res.status}`;
                throw new Error(msg);
            }

            setSaveOk(data);
            alert("Activo actualizado correctamente");
            router.push("/activos"); // Volver a la lista
        } catch (e: any) {
            setSaveError(e?.message ?? "Error desconocido");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8">Cargando datos del activo...</div>;
    if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

    // Render reutilizando steps
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">Editar Activo #{id}</h1>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
                <StepHeader step={step} />

                {step === 1 && (
                    <StepCompra
                        form={form}
                        set={set}
                        loading={false}
                        tipoAdquisicion={active(tipoAdquisicion)}
                        modalidades={active(modalidades)}
                    />
                )}

                {step === 2 && (
                    <StepInventario
                        form={form}
                        set={set}
                        loading={false}
                        clasificaciones={active(clasificaciones)}
                        estados={active(estados)}
                        needsPcSpecs={needsPcSpecs}
                    />
                )}

                {step === 3 && (
                    <StepPcSpecs
                        form={form}
                        set={set}
                    />
                )}

                {step === 4 && (
                    <StepAsignacion
                        form={form}
                        set={set}
                        loading={false}
                        cargos={active(cargos)}
                        tiposAsignacion={active(tiposAsignacion)}
                    />
                )}

                <StepNav
                    canBack={step !== 1}
                    canNext={!stepError}
                    isLast={step === 4}
                    error={stepError}
                    onBack={back}
                    onNext={next}
                    onSave={onSave}
                    saving={saving}
                    saveError={saveError}
                    saveOk={saveOk}
                />
            </div>
        </div>
    );
}

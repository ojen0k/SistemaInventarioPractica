"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormState, Step } from "./lib/types";
import { fetchCatalog } from "./lib/catalogos";

import { StepHeader } from "./components/StepHeader";
import { StepNav } from "./components/StepNav";
import { StepCompra } from "./components/steps/StepCompra";
import { StepInventario } from "./components/steps/StepInventario";
import { StepPcSpecs } from "./components/steps/StepPCSpecs";
import { StepAsignacion } from "./components/steps/StepAsignacion";


export default function NuevoActivoPage() {
    // Estado de la página
    const [step, setStep] = useState<Step>(1);
    const [loadingCats, setLoadingCats] = useState(true);
    const [errorCats, setErrorCats] = useState<string | null>(null);

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

    const active = (arr: any[]) => arr.filter((x) => x.activo !== false);

    useEffect(() => {
        let cancelled = false;

        async function loadCats() {
            try {
                setLoadingCats(true);
                setErrorCats(null);

                const [ta, mo, cl, es, ca, tAsig] = await Promise.all([
                    fetchCatalog("tipo-adquisicion"),
                    fetchCatalog("modalidad"),
                    fetchCatalog("clasificacion-activo"),
                    fetchCatalog("estado-activo"),
                    fetchCatalog("cargo"),
                    fetchCatalog("tipo-asignacion"),
                ]);

                if (cancelled) return;

                setTipoAdquisicion(ta);
                setModalidades(mo);
                setClasificaciones(cl);
                setEstados(es);
                setCargos(ca);
                setTiposAsignacion(tAsig);

                setForm((prev) => ({
                    ...prev,
                    tipoAdquisicionId: prev.tipoAdquisicionId || (active(ta)[0]?.id ?? ""),
                    modalidadId: prev.modalidadId || (active(mo)[0]?.id ?? ""),
                    clasificacionId: prev.clasificacionId || (active(cl)[0]?.id ?? ""),
                    estadoId: prev.estadoId || (active(es)[0]?.id ?? ""),
                    cargoId: prev.cargoId || (active(ca)[0]?.id ?? ""),
                    tipoAsignacionId: prev.tipoAsignacionId || (active(tAsig)[0]?.id ?? ""),
                }));


            } catch (e: any) {
                if (!cancelled) setErrorCats(e?.message ?? "Error cargando catálogos");
            } finally {
                if (!cancelled) setLoadingCats(false);
            }
        }

        loadCats();
        return () => {
            cancelled = true;
        };
    }, []);

    const clasificacionNombre = useMemo(() => {
        const found = clasificaciones.find((c) => c.id === form.clasificacionId);
        return (found?.nombre ?? "").toLowerCase();
    }, [clasificaciones, form.clasificacionId]);

    const needsPcSpecs = useMemo(() => clasificacionNombre.includes("comput"), [clasificacionNombre]);

    function validateStep(s: Step): string | null {
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
            // si no aplica (no es computador), no bloquear
            if (!needsPcSpecs) return null;

            const ip = (form.ip ?? "").trim();

            // IP es opcional: si está vacío, se permite continuar
            if (!ip) return null;

            // mientras valida, bloquea avance
            if (form.ipDisponible == null) return "Validando IP...";

            // IP ocupada, bloquea avance
            if (form.ipDisponible === false) return "La IP está ocupada. Cambia la IP o déjala vacía.";

            return null;
        }


        if (s === 4) {
            if (!form.areaId) return "Selecciona Área.";
            if (!form.direccionId) return "Selecciona Dirección.";
            if (!form.departamentoId) return "Selecciona Departamento.";
            if (!form.oficinaId) return "Selecciona Oficina.";
            if (!form.seccionProgramaId) return "Selecciona Sección/Programa.";

            if (!form.responsableNombre.trim()) return "Nombre responsable es obligatorio.";
            if (!form.cargoId) return "Selecciona cargo.";
            if (!form.fechaAsignacion) return "Fecha asignación es obligatoria.";
            if (!form.tipoAsignacionId) return "Selecciona tipo de asignación.";
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

    // Funcion de guardar activo para hacer POST
    async function onSave() {
        setSaving(true);
        setSaveError(null);
        setSaveOk(null);

        try {
            const API = process.env.NEXT_PUBLIC_API_URL;
            if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");

            const res = await fetch(`${API}/activos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const text = await res.text();
            let data: any = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = { raw: text };
            }

            if (!res.ok) {
                const msg = data?.message
                    ? Array.isArray(data.message)
                        ? data.message.join(" | ")
                        : String(data.message)
                    : `Error HTTP ${res.status}`;
                throw new Error(msg);
            }

            setSaveOk(data);
        } catch (e: any) {
            setSaveError(e?.message ?? "Error desconocido");
        } finally {
            setSaving(false);
        }
    }


    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold">Registrar activo</h1>
                <p className="text-sm text-gray-600">Wizard (componentes separados).</p>
            </div>

            {errorCats && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
                    <div className="font-medium">Error</div>
                    <div>{errorCats}</div>
                </div>
            )}

            <div className="rounded-lg border p-4 space-y-4">
                <StepHeader step={step} />

                {step === 1 && (
                    <StepCompra
                        form={form}
                        set={set}
                        loading={loadingCats}
                        tipoAdquisicion={active(tipoAdquisicion)}
                        modalidades={active(modalidades)}
                    />
                )}

                {step === 2 && (
                    <StepInventario
                        form={form}
                        set={set}
                        loading={loadingCats}
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
                        loading={loadingCats}
                        cargos={active(cargos)}
                        tiposAsignacion={active(tiposAsignacion)}
                    />
                )}


                <StepNav
                    canBack={step !== 1}
                    canNext={!loadingCats && !stepError}
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

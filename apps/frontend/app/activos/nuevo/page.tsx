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
    const [step, setStep] = useState<Step>(1);
    const [loadingCats, setLoadingCats] = useState(true);
    const [errorCats, setErrorCats] = useState<string | null>(null);

    const [tipoAdquisicion, setTipoAdquisicion] = useState<any[]>([]);
    const [modalidades, setModalidades] = useState<any[]>([]);
    const [clasificaciones, setClasificaciones] = useState<any[]>([]);
    const [estados, setEstados] = useState<any[]>([]);
    const [cargos, setCargos] = useState<any[]>([]);
    const [tiposAsignacion, setTiposAsignacion] = useState<any[]>([]);

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

        orgPathTexto: "",
        responsableNombre: "",
        cargoId: "",
        fechaAsignacion: "",
        tipoAsignacionId: "",
        observacionAsignacion: "",
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
        if (s === 4) {
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
        {
            step === 3 && (
                <StepPcSpecs
                    form={form}
                    set={set}
                />
            )
        }
        {
            step === 4 && (
                <StepAsignacion
                    form={form}
                    set={set}
                    loading={loadingCats}
                    cargos={active(cargos)}
                    tiposAsignacion={active(tiposAsignacion)}
                />
            )
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

    function onSaveMock() {
        console.log("FORM STATE:", form);
        alert("Por ahora: guardado mock (revisa consola).");
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


                <StepNav
                    canBack={step !== 1}
                    canNext={!loadingCats && !stepError}
                    isLast={step === 4}
                    error={stepError}
                    onBack={back}
                    onNext={next}
                    onSave={onSaveMock}
                />
            </div>
        </div>
    );
}

import type { Step } from "../lib/types";

export function StepHeader({ step }: { step: Step }) {
    const title =
        step === 1 ? "Orden de compra" :
            step === 2 ? "Inventario" :
                step === 3 ? "Specs (computador)" :
                    "Asignación";

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
                <span className="font-medium">Paso {step}</span>{" "}
                <span className="text-gray-600">{title}</span>
            </div>
        </div>
    );
}

export function StepNav({
    canBack,
    canNext,
    isLast,
    error,
    onBack,
    onNext,
    onSave,
    saving,
    saveError,
    saveOk,
}: {
    canBack: boolean;
    canNext: boolean;
    isLast: boolean;
    error: string | null;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
    saving: boolean;
    saveError: string | null;
    saveOk: any;
}) {
    return (
        <div className="flex items-center justify-between gap-3 pt-2">
            <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                onClick={onBack}
                disabled={!canBack}
            >
                Atrás
            </button>

            <div className="flex items-center gap-3">
                {error && <div className="text-sm text-red-600">{error}</div>}

                {!isLast ? (
                    <button
                        type="button"
                        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                        onClick={onNext}
                        disabled={!canNext}
                    >
                        Siguiente
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                )}
                {saveError && (
                    <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
                        <div className="font-medium">Error</div>
                        <div>{saveError}</div>
                    </div>
                )}

                {saveOk && (
                    <div className="mt-3 rounded-md border border-green-300 bg-green-50 p-3 text-sm">
                        <div className="font-medium">Guardado OK</div>
                        <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(saveOk, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}

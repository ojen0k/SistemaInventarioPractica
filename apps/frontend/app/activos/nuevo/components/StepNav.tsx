export function StepNav({
    canBack,
    canNext,
    isLast,
    error,
    onBack,
    onNext,
    onSave,
}: {
    canBack: boolean;
    canNext: boolean;
    isLast: boolean;
    error: string | null;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
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
                        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                        onClick={onSave}
                        disabled={!canNext}
                    >
                        Guardar (mock)
                    </button>
                )}
            </div>
        </div>
    );
}

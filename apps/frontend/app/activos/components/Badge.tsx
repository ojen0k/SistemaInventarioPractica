export function Badge({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none"
                >
                    <span className="sr-only">Remove</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                </button>
            )}
        </span>
    );
}

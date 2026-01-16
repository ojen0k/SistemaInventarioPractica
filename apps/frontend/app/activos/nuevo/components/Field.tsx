export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium">{label}</label>
            {children}
        </div>
    );
}

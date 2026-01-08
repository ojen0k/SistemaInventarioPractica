type Activo = {
    id: number;
    nombre: string;
    clasificacion: string;
    estado: string;
    unidadGestora: string;
};

const MOCK: Activo[] = [
    {
        id: 1,
        nombre: "Notebook Dell Latitude 5420",
        clasificacion: "Computadoras",
        estado: "En servicio",
        unidadGestora: "Municipal",
    },
    {
        id: 2,
        nombre: "Impresora HP LaserJet Pro M404",
        clasificacion: "Impresoras",
        estado: "Disponible",
        unidadGestora: "Educación",
    },
    {
        id: 3,
        nombre: "Router MikroTik hEX",
        clasificacion: "Accesorios",
        estado: "En servicio",
        unidadGestora: "Salud",
    },
];

export default function ActivosPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Activos</h1>
                    <p className="text-sm text-gray-600">
                        Listado de activos registrados (mock por ahora).
                    </p>
                </div>

                <a
                    href="/activos/nuevo"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                    + Registrar activo
                </a>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-left">
                            <th className="p-3">ID</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Clasificación</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Unidad gestora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="p-3">{a.id}</td>
                                <td className="p-3">{a.nombre}</td>
                                <td className="p-3">{a.clasificacion}</td>
                                <td className="p-3">{a.estado}</td>
                                <td className="p-3">{a.unidadGestora}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

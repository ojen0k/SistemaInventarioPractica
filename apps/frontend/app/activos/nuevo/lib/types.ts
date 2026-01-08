export type CatalogItem = {
    id: string;
    nombre: string;
    activo?: boolean;
};

export type FormState = {
    // Step 1
    ordenCompra: string;
    tipoAdquisicionId: string;
    modalidadId: string;
    numeroFactura: string;
    rutProveedor: string;
    nombreProveedor: string;
    anio: string;

    // Step 2
    clasificacionId: string;
    nombreActivo: string;
    marca: string;
    modelo: string;
    serialNumber: string;
    estadoId: string;
    ubicacionTexto: string;
    observacionActivo: string;

    // Step 3 (luego)
    procesador: string;
    memoria: string;
    almacenamiento: string;
    placaMadre: string;
    fuentePoder: string;
    macLan: string;
    macWifi: string;
    ip: string;

    // Step 4 (luego)
    orgPathTexto: string;
    responsableNombre: string;
    cargoId: string;
    fechaAsignacion: string;
    tipoAsignacionId: string;
    observacionAsignacion: string;
};

export type Step = 1 | 2 | 3 | 4;

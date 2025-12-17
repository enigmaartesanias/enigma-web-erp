-- Tabla de VENTAS
CREATE TABLE IF NOT EXISTS ventas (
    id SERIAL PRIMARY KEY,
    codigo_venta VARCHAR(20) UNIQUE NOT NULL, -- Ej: V-20251217-001
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_nombre VARCHAR(100) DEFAULT 'Cliente General',
    cliente_documento VARCHAR(20),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    descuento_monto DECIMAL(10, 2) DEFAULT 0,
    impuesto_monto DECIMAL(10, 2) DEFAULT 0, -- IGV
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo', -- Efectivo, Tarjeta, Yape, Plin
    estado VARCHAR(20) DEFAULT 'COMPLETADO', -- COMPLETADO, ANULADO
    observaciones TEXT
);

-- Tabla de DETALLES DE VENTA
CREATE TABLE IF NOT EXISTS detalles_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos_externos(id), -- CORREGIDO: UUID para coincidir con productos_externos
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL, -- Precio en el momento de la venta
    subtotal DECIMAL(10, 2) NOT NULL, -- cantidad * precio_unitario
    producto_nombre VARCHAR(200), -- Guardamos nombre por si se borra producto
    producto_codigo VARCHAR(50)   -- Guardamos código original
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_detalles_venta_venta_id ON detalles_venta(venta_id);

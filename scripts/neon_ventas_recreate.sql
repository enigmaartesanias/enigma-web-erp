-- ⚠️ ADVERTENCIA: Este script ELIMINARÁ las tablas de ventas existentes para limpiarlas
-- Ejecútalo solo si no tienes información importante en 'ventas' o 'venta_detalle'

-- 1. Limpieza de tablas antiguas o mal formadas
DROP TABLE IF EXISTS detalles_venta CASCADE;
DROP TABLE IF EXISTS venta_detalle CASCADE; -- Borramos esta también por si acaso (aparecía en tu imagen)
DROP TABLE IF EXISTS ventas CASCADE;

-- 2. Creación de la tabla VENTAS (Correcta)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    codigo_venta VARCHAR(20) UNIQUE NOT NULL, -- Ej: V-20251217-001
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cliente_nombre VARCHAR(100) DEFAULT 'Cliente General',
    cliente_documento VARCHAR(20),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    descuento_monto DECIMAL(10, 2) DEFAULT 0,
    impuesto_monto DECIMAL(10, 2) DEFAULT 0, -- IGV
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    estado VARCHAR(20) DEFAULT 'COMPLETADO',
    observaciones TEXT
);

-- 3. Creación de la tabla DETALLES_VENTA (Correcta, con UUID)
CREATE TABLE detalles_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos_externos(id), -- Conectado a productos_externos (UUID)
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    producto_nombre VARCHAR(200),
    producto_codigo VARCHAR(50)
);

-- 4. Creación de Índices
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_detalles_venta_venta_id ON detalles_venta(venta_id);

-- Tabla para Productos Comerciales (Compra/Venta)
CREATE TABLE IF NOT EXISTS productos_externos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_usuario TEXT NOT NULL, -- Clave manual (ej: ARE010) - Permite duplicados para agrupar modelos
    nombre TEXT NOT NULL,
    categoria TEXT, -- Aretes, Pulseras, etc.
    descripcion TEXT,
    costo DECIMAL(10, 2) DEFAULT 0,
    precio DECIMAL(10, 2) DEFAULT 0,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    unidad TEXT DEFAULT 'Unidad',
    imagen_url TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_productos_externos_codigo ON productos_externos(codigo_usuario);
CREATE INDEX IF NOT EXISTS idx_productos_externos_nombre ON productos_externos(nombre);

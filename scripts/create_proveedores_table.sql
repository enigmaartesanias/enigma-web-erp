-- ========================================
-- CREAR TABLA: proveedores
-- ========================================
-- Tabla para gestionar proveedores de forma centralizada

CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON proveedores(nombre);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);

-- Comentario
COMMENT ON TABLE proveedores IS 'Catálogo de proveedores para compras';

-- Insertar algunos proveedores de ejemplo (opcional)
INSERT INTO proveedores (nombre, contacto, telefono) VALUES
('Proveedor General', NULL, NULL),
('Importadora XYZ', 'Juan Pérez', '999-888-777'),
('Distribuidora ABC', 'María López', '888-777-666')
ON CONFLICT DO NOTHING;

-- Verificación
SELECT * FROM proveedores;

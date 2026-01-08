-- Tabla para tipos de materiales/insumos predefinidos
CREATE TABLE IF NOT EXISTS tipos_materiales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    unidad VARCHAR(20) NOT NULL CHECK (unidad IN ('Gramos', 'Unidad', 'Mililitros')),
    detalle TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_tipos_materiales_activo ON tipos_materiales(activo);
CREATE INDEX idx_tipos_materiales_nombre ON tipos_materiales(nombre);

-- Datos de ejemplo (opcional)
INSERT INTO tipos_materiales (nombre, unidad, detalle) VALUES
('Alambre de cobre', 'Gramos', 'Cable de cobre para joyería'),
('Resina epoxi', 'Mililitros', 'Resina transparente para acabados'),
('Cadena de plata', 'Unidad', 'Cadenas individuales'),
('Piedras naturales', 'Unidad', 'Gemas y piedras decorativas')
ON CONFLICT (nombre) DO NOTHING;

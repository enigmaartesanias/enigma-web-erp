-- Crear tabla de clientes (solo nombre y teléfono)
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Agregar cliente_id a ventas (nullable para mantener compatibilidad)
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_id INTEGER REFERENCES clientes(id);

-- Agregar índice para búsquedas por cliente
CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id ON ventas(cliente_id);

-- Schema CORRECTO para Sistema de Pedidos en Neon DB
-- Basado en el esquema real de Supabase
-- EJECUTAR ANTES de migrar los datos

-- Tabla principal de pedidos (esquema de Supabase)
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido SERIAL PRIMARY KEY,
    nombre_cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    dni_ruc VARCHAR(50),
    direccion_entrega TEXT,
    forma_pago VARCHAR(50),
    comprobante_pago VARCHAR(100),
    requiere_envio BOOLEAN DEFAULT FALSE,
    modalidad_envio VARCHAR(50),
    envio_cobrado_al_cliente NUMERIC(10, 2) DEFAULT 0,
    envio_referencia NUMERIC(10, 2) DEFAULT 0,
    precio_total_sin_igv NUMERIC(10, 2) DEFAULT 0,
    precio_total NUMERIC(10, 2) DEFAULT 0,
    monto_a_cuenta NUMERIC(10, 2) DEFAULT 0,
    monto_igv NUMERIC(10, 2) DEFAULT 0,
    monto_saldo NUMERIC(10, 2) DEFAULT 0,
    entregado BOOLEAN DEFAULT FALSE,
    cancelado BOOLEAN DEFAULT FALSE,
    incluye_igv BOOLEAN DEFAULT FALSE,
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalles de pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    nombre_producto TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    monto NUMERIC(10, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago VARCHAR(50),
    referencia VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CRÍTICO: Deshabilitar RLS para permitir inserciones
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagos DISABLE ROW LEVEL SECURITY;

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(nombre_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(cancelado, entregado);
CREATE INDEX IF NOT EXISTS idx_detalles_pedido ON detalles_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido ON pagos(id_pedido);

-- Comentarios para documentación
COMMENT ON TABLE pedidos IS 'Sistema de pedidos migrado desde Supabase - DIFERENTE a pedidos_enigma';
COMMENT ON TABLE detalles_pedido IS 'Detalles de productos por pedido';
COMMENT ON TABLE pagos IS 'Historial de pagos por pedido';

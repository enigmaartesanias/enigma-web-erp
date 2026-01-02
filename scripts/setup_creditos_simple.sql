-- =====================================================
-- SCRIPT SIMPLE: Solo configurar sistema de créditos
-- SIN migración de datos antiguos
-- =====================================================

-- PARTE 1: Agregar columnas a tabla ventas
-- =====================================================
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS es_credito BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS saldo_pendiente DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP;

-- PARTE 2: Crear tabla de pagos
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    observaciones TEXT
);

-- PARTE 3: Crear índices
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ventas_credito 
ON ventas(es_credito, saldo_pendiente) 
WHERE es_credito = TRUE;

CREATE INDEX IF NOT EXISTS idx_ventas_saldo_pendiente 
ON ventas(saldo_pendiente) 
WHERE saldo_pendiente > 0;

CREATE INDEX IF NOT EXISTS idx_pagos_venta 
ON pagos(venta_id);

-- =====================================================
-- VERIFICACIÓN: Mostrar estructura
-- =====================================================
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ventas'
AND column_name IN ('es_credito', 'saldo_pendiente', 'fecha_vencimiento')
ORDER BY ordinal_position;

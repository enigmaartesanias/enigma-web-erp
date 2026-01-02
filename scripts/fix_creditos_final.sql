-- =====================================================
-- SCRIPT DEFINITIVO: Recrear tabla pagos correctamente
-- =====================================================

-- PARTE 1: Eliminar tabla pagos antigua (si existe con estructura incorrecta)
-- =====================================================
DROP TABLE IF EXISTS pagos CASCADE;

-- PARTE 2: Agregar columnas a tabla ventas
-- =====================================================
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS es_credito BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS saldo_pendiente DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP;

-- PARTE 3: Crear tabla de pagos con estructura correcta
-- =====================================================
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    observaciones TEXT
);

-- PARTE 4: Crear índices
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ventas_credito 
ON ventas(es_credito, saldo_pendiente) 
WHERE es_credito = TRUE;

CREATE INDEX IF NOT EXISTS idx_pagos_venta 
ON pagos(venta_id);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ver estructura de tabla pagos
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'pagos'
ORDER BY ordinal_position;

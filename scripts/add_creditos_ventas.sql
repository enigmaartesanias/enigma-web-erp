-- Script para agregar funcionalidad de créditos a tabla ventas existente
-- Sistema simplificado con pestañas en reporte
-- Fecha: 2026-01-01

-- =====================================================
-- MODIFICAR TABLA VENTAS
-- =====================================================
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS es_credito BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS saldo_pendiente DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP;

-- Comentarios para documentación
COMMENT ON COLUMN ventas.es_credito IS 'Indica si la venta es a crédito (TRUE) o al contado (FALSE)';
COMMENT ON COLUMN ventas.saldo_pendiente IS 'Saldo que el cliente aún debe. Empieza = total, disminuye con pagos';
COMMENT ON COLUMN ventas.fecha_vencimiento IS 'Fecha límite para pagar la deuda (solo si es_credito = TRUE)';

-- =====================================================
-- CREAR TABLA DE PAGOS (Historial)
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    observaciones TEXT
);

-- Comentarios
COMMENT ON TABLE pagos IS 'Historial de abonos/pagos a ventas a crédito';
COMMENT ON COLUMN pagos.venta_id IS 'Referencia a la venta que se está pagando';
COMMENT ON COLUMN pagos.monto IS 'Monto del pago parcial o total';

-- =====================================================
-- ÍNDICES para optimización
-- =====================================================
-- Índice para filtrar ventas a crédito rápidamente
CREATE INDEX IF NOT EXISTS idx_ventas_credito 
ON ventas(es_credito, saldo_pendiente) 
WHERE es_credito = TRUE;

-- Índice para filtrar créditos pendientes
CREATE INDEX IF NOT EXISTS idx_ventas_saldo_pendiente 
ON ventas(saldo_pendiente) 
WHERE saldo_pendiente > 0;

-- Índice para historial de pagos por venta
CREATE INDEX IF NOT EXISTS idx_pagos_venta 
ON pagos(venta_id);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Consulta para verificar que los campos fueron agregados:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'ventas' 
-- AND column_name IN ('es_credito', 'saldo_pendiente', 'fecha_vencimiento');

-- Consulta para ver ventas a crédito pendientes:
-- SELECT codigo_venta, cliente_nombre, total, saldo_pendiente, fecha_vencimiento
-- FROM ventas 
-- WHERE es_credito = TRUE AND saldo_pendiente > 0
-- ORDER BY fecha_vencimiento ASC;

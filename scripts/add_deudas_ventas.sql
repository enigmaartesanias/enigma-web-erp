-- Script para agregar funcionalidad de deudas/crédito en el sistema de ventas
-- Fecha: 2026-01-01
-- Autor: Sistema ERP Enigma Artesanías

-- Agregar campos para gestión de deudas/crédito en ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS es_credito BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS monto_deuda DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fecha_vencimiento_deuda TIMESTAMP,
ADD COLUMN IF NOT EXISTS deuda_pagada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_pago_deuda TIMESTAMP;

-- Crear índice para consultas de deudas pendientes (optimización de rendimiento)
CREATE INDEX IF NOT EXISTS idx_ventas_deudas_pendientes 
ON ventas(es_credito, deuda_pagada) 
WHERE es_credito = TRUE AND deuda_pagada = FALSE;

-- Comentarios para documentación del esquema
COMMENT ON COLUMN ventas.es_credito IS 'Indica si la venta es a crédito (TRUE) o al contado (FALSE)';
COMMENT ON COLUMN ventas.monto_deuda IS 'Monto total de la deuda que el cliente debe';
COMMENT ON COLUMN ventas.fecha_vencimiento_deuda IS 'Fecha límite para el pago de la deuda';
COMMENT ON COLUMN ventas.deuda_pagada IS 'Indica si la deuda fue liquidada completamente';
COMMENT ON COLUMN ventas.fecha_pago_deuda IS 'Fecha en que se registró el pago de la deuda';

-- Verificar que los campos fueron agregados correctamente
-- Ejecutar esta consulta para confirmar la estructura de la tabla:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'ventas' 
-- ORDER BY ordinal_position;

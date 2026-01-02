-- =====================================================
-- SCRIPT: Actualizar manualmente la venta de Sabina
-- Ejecutar DESPUÉS del setup_creditos_simple.sql
-- =====================================================

-- Actualizar venta 0047 (Sabina) como crédito
UPDATE ventas
SET 
    es_credito = TRUE,
    saldo_pendiente = 40.00, -- Total de la venta
    fecha_vencimiento = '2026-01-08' -- 7 días desde hoy
WHERE codigo_venta = '0047';

-- Verificar
SELECT 
    codigo_venta,
    cliente_nombre,
    total,
    es_credito,
    saldo_pendiente,
    fecha_vencimiento
FROM ventas
WHERE codigo_venta = '0047';

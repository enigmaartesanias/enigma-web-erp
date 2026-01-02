-- =====================================================
-- SCRIPT COMPLETO: Agregar sistema de créditos + Migración
-- Ejecutar TODO de una vez en Neon DB
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

-- PARTE 4: Migrar cuentas por cobrar existentes
-- =====================================================
UPDATE ventas v
SET 
    es_credito = TRUE,
    saldo_pendiente = c.saldo_deudor,
    fecha_vencimiento = c.fecha_vencimiento
FROM cuentas_por_cobrar c
WHERE v.id = c.venta_id;

-- PARTE 5: Migrar historial de pagos
-- =====================================================
INSERT INTO pagos (venta_id, fecha_pago, monto, metodo_pago, observaciones)
SELECT 
    c.venta_id,
    pc.fecha_pago,
    pc.monto,
    pc.metodo_pago,
    pc.observaciones
FROM pagos_cuenta pc
JOIN cuentas_por_cobrar c ON pc.cuenta_id = c.id
WHERE NOT EXISTS (
    SELECT 1 FROM pagos p
    WHERE p.venta_id = c.venta_id 
    AND p.fecha_pago = pc.fecha_pago 
    AND p.monto = pc.monto
);

-- PARTE 6: Verificación - Mostrar créditos pendientes
-- =====================================================
SELECT 
    v.codigo_venta,
    v.cliente_nombre,
    v.total,
    v.es_credito,
    v.saldo_pendiente,
    v.fecha_vencimiento,
    (SELECT COUNT(*) FROM pagos WHERE venta_id = v.id) as num_pagos
FROM ventas v
WHERE v.es_credito = TRUE 
  AND v.saldo_pendiente > 0
ORDER BY v.fecha_vencimiento ASC;

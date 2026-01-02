-- Script de verificación y corrección para migración de créditos

-- =====================================================
-- PASO 1: Verificar si la tabla pagos existe
-- =====================================================
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'pagos'
) as tabla_pagos_existe;

-- =====================================================
-- PASO 2: Verificar estructura de la tabla pagos
-- =====================================================
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'pagos'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 3: Si la tabla no existe, crearla
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    observaciones TEXT
);

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_pagos_venta ON pagos(venta_id);

-- =====================================================
-- PASO 4: Ahora sí, migrar todas las cuentas por cobrar
-- =====================================================
UPDATE ventas v
SET 
    es_credito = TRUE,
    saldo_pendiente = c.saldo_deudor,
    fecha_vencimiento = c.fecha_vencimiento
FROM cuentas_por_cobrar c
WHERE v.id = c.venta_id;

-- =====================================================
-- PASO 5: Migrar historial de pagos
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

-- =====================================================
-- PASO 6: Verificación final
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

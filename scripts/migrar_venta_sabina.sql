-- Script para migrar venta de Sabina al nuevo sistema de créditos
-- La venta existe en la tabla cuentas_por_cobrar pero no tiene los campos en ventas

-- 1. Verificar la venta de Sabina (código 0047)
-- SELECT * FROM ventas WHERE codigo_venta = '0047';

-- 2. Verificar su cuenta por cobrar
-- SELECT * FROM cuentas_por_cobrar WHERE venta_id = (SELECT id FROM ventas WHERE codigo_venta = '0047');

-- 3. Actualizar la venta con los campos de crédito
UPDATE ventas
SET 
    es_credito = TRUE,
    saldo_pendiente = (
        SELECT saldo_deudor 
        FROM cuentas_por_cobrar 
        WHERE venta_id = ventas.id
    ),
    fecha_vencimiento = (
        SELECT fecha_vencimiento 
        FROM cuentas_por_cobrar 
        WHERE venta_id = ventas.id
    )
WHERE codigo_venta = '0047';

-- 4. Migrar historial de pagos de la tabla pagos_cuenta a pagos
INSERT INTO pagos (venta_id, fecha_pago, monto, metodo_pago, observaciones)
SELECT 
    c.venta_id,
    p.fecha_pago,
    p.monto,
    p.metodo_pago,
    p.observaciones
FROM pagos_cuenta p
JOIN cuentas_por_cobrar c ON p.cuenta_id = c.id
WHERE c.venta_id = (SELECT id FROM ventas WHERE codigo_venta = '0047')
AND NOT EXISTS (
    SELECT 1 FROM pagos 
    WHERE venta_id = c.venta_id 
    AND fecha_pago = p.fecha_pago 
    AND monto = p.monto
);

-- 5. Verificar resultado
SELECT 
    v.codigo_venta,
    v.cliente_nombre,
    v.total,
    v.es_credito,
    v.saldo_pendiente,
    v.fecha_vencimiento,
    (SELECT COUNT(*) FROM pagos WHERE venta_id = v.id) as num_pagos
FROM ventas v
WHERE v.codigo_venta = '0047';

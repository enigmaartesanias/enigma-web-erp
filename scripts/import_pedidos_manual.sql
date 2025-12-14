-- ========================================
-- Migración completa de Pedidos desde Supabase a Neon DB
-- Exportado manualmente el: 2025-12-14
-- Total: 4 pedidos, 9 detalles, 6 pagos
-- ========================================

-- PASO 1: Deshabilitar RLS
ALTER TABLE IF EXISTS pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS detalles_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pagos DISABLE ROW LEVEL SECURITY;

-- PASO 2: Limpiar tablas (PostgreSQL no soporta IF EXISTS en TRUNCATE)
TRUNCATE TABLE pagos, detalles_pedido, pedidos RESTART IDENTITY CASCADE;

-- ========================================
-- PEDIDOS
-- ========================================

-- Pedido #16: Carolina
INSERT INTO pedidos (
    nombre_cliente, telefono, dni_ruc, direccion_entrega,
    forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
    envio_cobrado_al_cliente, envio_referencia,
    precio_total_sin_igv, precio_total, monto_a_cuenta,
    monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
    fecha_pedido
) VALUES (
    'Carolina', '996 186 721', '10014301', 'Calle Steves mz C9 Lt 32 Cedros de Villa - Chorrillos',
    'Yape', NULL, true, 'Fijo',
    10.00, 0.00,
    180.00, 190.00, 190.00,
    0.00, 0.00, false, true, false,
    '2025-12-09'
);

-- Pedido #17: Helga
INSERT INTO pedidos (
    nombre_cliente, telefono, dni_ruc, direccion_entrega,
    forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
    envio_cobrado_al_cliente, envio_referencia,
    precio_total_sin_igv, precio_total, monto_a_cuenta,
    monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
    fecha_pedido
) VALUES (
    'Helga', '993 817 177', NULL, NULL,
    'Efectivo', NULL, false, 'Fijo',
    0.00, 0.00,
    50.00, 50.00, 50.00,
    0.00, 0.00, false, true, false,
    '2025-12-09'
);

-- Pedido #18: Liliana
INSERT INTO pedidos (
    nombre_cliente, telefono, dni_ruc, direccion_entrega,
    forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
    envio_cobrado_al_cliente, envio_referencia,
    precio_total_sin_igv, precio_total, monto_a_cuenta,
    monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
    fecha_pedido
) VALUES (
    'Liliana', '997 224 771', NULL, NULL,
    'Yape', NULL, false, 'Fijo',
    0.00, 0.00,
    170.00, 170.00, 120.00,
    0.00, 50.00, false, false, false,
    '2025-12-09'
);

-- Pedido #19: Shirley
INSERT INTO pedidos (
    nombre_cliente, telefono, dni_ruc, direccion_entrega,
    forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
    envio_cobrado_al_cliente, envio_referencia,
    precio_total_sin_igv, precio_total, monto_a_cuenta,
    monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
    fecha_pedido
) VALUES (
    'Shirley', '959 982 863', NULL, NULL,
    'Yape', NULL, false, 'Fijo',
    0.00, 0.00,
    180.00, 180.00, 130.00,
    0.00, 50.00, false, false, false,
    '2025-12-09'
);

-- ========================================
-- DETALLES DE PEDIDO
-- ========================================

-- Detalles del Pedido #16 (Carolina) - id_pedido = 1 en Neon
INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (1, 'Anillo plata obsidiana', 1, 100.00);

INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (1, 'Juego de alpaca con obsidiana', 1, 80.00);

-- Detalles del Pedido #17 (Helga) - id_pedido = 2 en Neon
INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (2, 'Pulsera de mujer lila: NAOMI.', 1, 25.00);

INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (2, 'Pulsera de hombre negro: BRYAN.', 1, 25.00);

-- Detalles del Pedido #18 (Liliana) - id_pedido = 3 en Neon
INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (3, 'Pulsera de cobre mariposa 16cm amatista', 1, 60.00);

INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (3, 'Pulsera cobre ojo de tigre', 1, 80.00);

INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (3, 'Pulsera de cobre', 1, 30.00);

-- Detalles del Pedido #19 (Shirley) - id_pedido = 4 en Neon
INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (4, 'Vincha de cobre', 1, 80.00);

INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
VALUES (4, 'Tiara de cobre con amatista', 1, 100.00);

-- ========================================
-- PAGOS
-- ========================================

-- Pagos del Pedido #16 (Carolina) - id_pedido = 1 en Neon
INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
VALUES (1, 190.00, '2025-12-09', 'Yape', NULL);

-- Pagos del Pedido #17 (Helga) - id_pedido = 2 en Neon
INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
VALUES (2, 20.00, '2025-12-09', 'Yape', NULL);

INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
VALUES (2, 30.00, '2025-12-14', 'Efectivo', NULL);

-- Pagos del Pedido #18 (Liliana) - id_pedido = 3 en Neon
INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
VALUES (3, 120.00, '2025-12-09', 'Yape', NULL);

-- Pagos del Pedido #19 (Shirley) - id_pedido = 4 en Neon
INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
VALUES (4, 80.00, '2025-12-09', 'Yape', NULL);

INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
VALUES (4, 50.00, '2025-12-09', 'Yape', NULL);

-- ========================================
-- VERIFICACIÓN
-- ========================================

SELECT 'Pedidos:' as tabla, COUNT(*) as total FROM pedidos
UNION ALL
SELECT 'Detalles:', COUNT(*) FROM detalles_pedido
UNION ALL
SELECT 'Pagos:', COUNT(*) FROM pagos;

-- Ver algunos datos
SELECT id_pedido, nombre_cliente, precio_total FROM pedidos ORDER BY id_pedido;

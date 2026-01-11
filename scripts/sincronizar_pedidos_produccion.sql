-- Script para crear registros de producción faltantes para pedidos #019 y #015
-- Estos pedidos ya están marcados como "en_proceso" pero no tienen registros en produccion_taller

-- Pedido #019 - Carla Najar - Pulsera de Alpaca
INSERT INTO produccion_taller (
    pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto,
    cantidad, costo_materiales, mano_de_obra, porcentaje_alquiler,
    costo_herramientas, otros_gastos, estado_produccion, observaciones
)
SELECT 
    19 as pedido_id,
    'PEDIDO' as tipo_produccion,
    COALESCE(d.metal, p.metal, 'Alpaca') as metal,
    COALESCE(d.tipo_producto, p.tipo_producto, 'Pulsera') as tipo_producto,
    p.nombre_cliente || ' - ' || d.nombre_producto as nombre_producto,
    d.cantidad,
    0 as costo_materiales,
    0 as mano_de_obra,
    0 as porcentaje_alquiler,
    0 as costo_herramientas,
    0 as otros_gastos,
    'en_proceso' as estado_produccion,
    'Registro creado para sincronizar con pedidos existentes' as observaciones
FROM pedidos p
INNER JOIN detalles_pedido d ON p.id_pedido = d.id_pedido
WHERE p.id_pedido = 19
AND NOT EXISTS (
    SELECT 1 FROM produccion_taller pt 
    WHERE pt.pedido_id = 19 
    AND pt.nombre_producto LIKE '%' || d.nombre_producto || '%'
);

-- Pedido #015 - Shirley - 2 Collares de Cobre
INSERT INTO produccion_taller (
    pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto,
    cantidad, costo_materiales, mano_de_obra, porcentaje_alquiler,
    costo_herramientas, otros_gastos, estado_produccion, observaciones
)
SELECT 
    15 as pedido_id,
    'PEDIDO' as tipo_produccion,
    COALESCE(d.metal, p.metal, 'Cobre') as metal,
    COALESCE(d.tipo_producto, p.tipo_producto, 'Collar') as tipo_producto,
    p.nombre_cliente || ' - ' || d.nombre_producto as nombre_producto,
    d.cantidad,
    0 as costo_materiales,
    0 as mano_de_obra,
    0 as porcentaje_alquiler,
    0 as costo_herramientas,
    0 as otros_gastos,
    'en_proceso' as estado_produccion,
    'Registro creado para sincronizar con pedidos existentes' as observaciones
FROM pedidos p
INNER JOIN detalles_pedido d ON p.id_pedido = d.id_pedido
WHERE p.id_pedido = 15
AND NOT EXISTS (
    SELECT 1 FROM produccion_taller pt 
    WHERE pt.pedido_id = 15 
    AND pt.nombre_producto LIKE '%' || d.nombre_producto || '%'
);

-- Verificar que se crearon correctamente
SELECT 
    id_produccion,
    pedido_id,
    nombre_producto,
    estado_produccion,
    tipo_produccion
FROM produccion_taller
WHERE pedido_id IN (19, 15)
ORDER BY pedido_id, created_at DESC;

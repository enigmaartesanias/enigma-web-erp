-- ================================================
-- FIX SCHEMA: Recrear Vista Producción
-- ================================================

-- 1. Eliminar la vista existente para evitar conflictos de columnas
DROP VIEW IF EXISTS v_produccion_con_precios;

-- 2. Crear la vista actualizada con los nuevos campos
CREATE OR REPLACE VIEW v_produccion_con_precios AS
SELECT 
    pr.id_produccion,
    pr.pedido_id,
    pr.tipo_produccion,
    pr.metal,
    pr.tipo_producto,
    pr.nombre_producto,
    pr.cantidad,
    pr.costo_materiales,
    pr.horas_trabajo,
    pr.costo_hora,
    pr.costo_herramientas,
    pr.otros_gastos,
    pr.estado_produccion,
    pr.observaciones,
    pr.fecha_produccion,
    pr.created_at,
    pr.imagen_url,           -- Nuevo campo
    pr.codigo_producto,      -- Nuevo campo
    pr.transferido_inventario, -- Nuevo campo
    
    -- Datos del pedido (si existe)
    ped.nombre_cliente,
    ped.telefono,
    ped.precio_total as precio_venta_pedido,
    
    -- CÁLCULOS
    (pr.horas_trabajo * pr.costo_hora) as costo_mano_obra,
    
    (pr.costo_materiales + 
     (pr.horas_trabajo * pr.costo_hora) + 
     pr.costo_herramientas + 
     pr.otros_gastos) as costo_total_unitario,
    
    ((pr.costo_materiales + 
      (pr.horas_trabajo * pr.costo_hora) + 
      pr.costo_herramientas + 
      pr.otros_gastos) * pr.cantidad) as costo_total_produccion,
    
    -- Ganancia SOLO si es pedido
    CASE 
        WHEN pr.pedido_id IS NOT NULL AND ped.precio_total IS NOT NULL THEN
            ped.precio_total - (pr.costo_materiales + 
                               (pr.horas_trabajo * pr.costo_hora) + 
                               pr.costo_herramientas + 
                               pr.otros_gastos)
        ELSE NULL
    END as ganancia_estimada_pedido
    
FROM produccion_taller pr
LEFT JOIN pedidos ped ON pr.pedido_id = ped.id_pedido
ORDER BY pr.fecha_produccion DESC, pr.created_at DESC;

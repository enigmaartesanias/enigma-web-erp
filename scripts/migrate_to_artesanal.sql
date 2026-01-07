-- ================================================
-- MIGRATION: Modelo Artesanal (Sin Horas)
-- ================================================

-- 1. Agregar columnas para el nuevo modelo
ALTER TABLE produccion_taller 
ADD COLUMN IF NOT EXISTS mano_de_obra DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS porcentaje_alquiler DECIMAL(5, 2) DEFAULT 0;

-- 2. Migrar datos existentes (Convertir horas a mano de obra fija)
-- Solo si mano_de_obra es 0 y hay horas registradas
UPDATE produccion_taller
SET mano_de_obra = (horas_trabajo * costo_hora)
WHERE mano_de_obra = 0 AND (horas_trabajo > 0 OR costo_hora > 0);

-- 3. Recrear Vista con nueva fórmula Simplificada
DROP VIEW IF EXISTS v_produccion_con_precios;

CREATE OR REPLACE VIEW v_produccion_con_precios AS
SELECT 
    pr.id_produccion,
    pr.pedido_id,
    pr.tipo_produccion,
    pr.metal,
    pr.tipo_producto,
    pr.nombre_producto,
    pr.cantidad,
    
    -- Costos Directos
    pr.costo_materiales,
    pr.mano_de_obra,         -- Nuevo Campo Principal
    pr.costo_herramientas,
    pr.otros_gastos,
    
    -- Referencial
    pr.porcentaje_alquiler,
    
    -- Campos Legacy pero mantenidos por compatibilidad (opcionales)
    pr.horas_trabajo,
    pr.costo_hora,
    
    pr.estado_produccion,
    pr.observaciones,
    pr.fecha_produccion,
    pr.created_at,
    pr.imagen_url,
    pr.codigo_producto,
    pr.transferido_inventario,
    
    -- Datos del pedido
    ped.nombre_cliente,
    ped.telefono,
    ped.precio_total as precio_venta_pedido,
    
    -- CÁLCULOS (Nueva Fórmula Simplificada)
    -- Total Unitario = Materiales + Mano Obra + Herramientas + Otros
    (pr.costo_materiales + 
     pr.mano_de_obra + 
     pr.costo_herramientas + 
     pr.otros_gastos) as costo_total_unitario,
    
    -- Total Producción = Unitario * Cantidad
    ((pr.costo_materiales + 
      pr.mano_de_obra + 
      pr.costo_herramientas + 
      pr.otros_gastos) * pr.cantidad) as costo_total_produccion,
    
    -- Ganancia Estimada (Pedido)
    CASE 
        WHEN pr.pedido_id IS NOT NULL AND ped.precio_total IS NOT NULL THEN
            ped.precio_total - ((pr.costo_materiales + 
                                pr.mano_de_obra + 
                                pr.costo_herramientas + 
                                pr.otros_gastos))
        ELSE NULL
    END as ganancia_estimada_pedido
    
FROM produccion_taller pr
LEFT JOIN pedidos ped ON pr.pedido_id = ped.id_pedido
ORDER BY pr.fecha_produccion DESC, pr.created_at DESC;

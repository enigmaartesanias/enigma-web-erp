-- ================================================
-- SCHEMA: Sistema de Producción (Rediseñado)
-- ================================================
-- Producción solo registra COSTOS, no precios ni ganancias
-- Vinculado a pedidos para flujo completo
-- Ejecutar en la consola SQL de Neon DB

-- ================================================
-- PASO 1: Actualizar tabla PEDIDOS
-- ================================================
-- Agregar campos de producto si no existen
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS metal VARCHAR(50),
ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(50);

-- ================================================
-- PASO 2: Eliminar tablas antiguas
-- ================================================
DROP TABLE IF EXISTS produccion_taller CASCADE;
DROP TABLE IF EXISTS productos CASCADE;

-- ================================================
-- PASO 3: Crear nueva tabla PRODUCCION_TALLER
-- ================================================
CREATE TABLE produccion_taller (
    id_produccion SERIAL PRIMARY KEY,
    
    -- ENLACE A PEDIDO (nullable - NULL = producción para stock)
    pedido_id INTEGER REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
    
    -- Tipo de producción
    tipo_produccion VARCHAR(20) DEFAULT 'STOCK',
    -- Valores permitidos: 'PEDIDO' | 'STOCK'
    
    -- Datos del producto
    metal VARCHAR(50) NOT NULL,
    tipo_producto VARCHAR(50) NOT NULL,
    -- Metales: 'Plata', 'Alpaca', 'Cobre', 'Bronce'
    -- Tipos: 'Anillo', 'Arete', 'Collar', 'Pulsera'
    nombre_producto VARCHAR(255),
    cantidad INTEGER DEFAULT 1 CHECK (cantidad > 0),
    
    -- COSTOS DE FABRICACIÓN (lo importante)
    costo_materiales DECIMAL(10, 2) DEFAULT 0,
    horas_trabajo DECIMAL(10, 2) DEFAULT 0,
    costo_hora DECIMAL(10, 2) DEFAULT 0,
    costo_herramientas DECIMAL(10, 2) DEFAULT 0,
    otros_gastos DECIMAL(10, 2) DEFAULT 0,
    
    -- Estado de producción
    estado_produccion VARCHAR(20) DEFAULT 'pendiente',
    -- Valores: 'pendiente', 'en_proceso', 'terminado'
    
    -- Observaciones
    observaciones TEXT,
    
    -- Fechas
    fecha_produccion DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- PASO 4: Índices
-- ================================================
CREATE INDEX idx_produccion_pedido ON produccion_taller(pedido_id);
CREATE INDEX idx_produccion_tipo ON produccion_taller(tipo_produccion);
CREATE INDEX idx_produccion_fecha ON produccion_taller(fecha_produccion);
CREATE INDEX idx_produccion_estado ON produccion_taller(estado_produccion);

-- ================================================
-- PASO 5: Triggers
-- ================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_produccion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_produccion_updated_at 
    BEFORE UPDATE ON produccion_taller 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_produccion();

-- ================================================
-- PASO 6: Vista con cálculos (SIN duplicar datos)
-- ================================================
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
    
    -- Datos del pedido (si existe)
    ped.nombre_cliente,
    ped.telefono,
    ped.precio_total as precio_venta_pedido,
    
    -- CÁLCULOS (no guardados, solo calculados)
    (pr.horas_trabajo * pr.costo_hora) as costo_mano_obra,
    
    (pr.costo_materiales + 
     (pr.horas_trabajo * pr.costo_hora) + 
     pr.costo_herramientas + 
     pr.otros_gastos) as costo_total_unitario,
    
    ((pr.costo_materiales + 
      (pr.horas_trabajo * pr.costo_hora) + 
      pr.costo_herramientas + 
      pr.otros_gastos) * pr.cantidad) as costo_total_produccion,
    
    -- Ganancia SOLO si es pedido (comparación, no guardada)
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

-- ================================================
-- PASO 7: Datos de ejemplo
-- ================================================

-- Ejemplo 1: Producción vinculada a pedido existente
-- (Solo si tienes pedidos en la tabla)
INSERT INTO produccion_taller 
    (pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto, cantidad, 
     costo_materiales, horas_trabajo, costo_hora, costo_herramientas, otros_gastos, 
     estado_produccion, observaciones)
SELECT 
    id_pedido,
    'PEDIDO',
    COALESCE(metal, 'Plata'),
    COALESCE(tipo_producto, 'Anillo'),
    nombre_cliente || ' - Pedido ' || id_pedido,
    1,
    25.50,
    2.0,
    0,
    5.00,
    0,
    'pendiente',
    'Producción creada desde pedido existente'
FROM pedidos
LIMIT 1;

-- Ejemplo 2: Producción para stock (sin pedido)
INSERT INTO produccion_taller 
    (pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto, cantidad, 
     costo_materiales, horas_trabajo, costo_hora, estado_produccion)
VALUES
    (NULL, 'STOCK', 'Alpaca', 'Arete', 'Arete Circular de Alpaca', 5, 15.00, 1.5, 0, 'terminado'),
    (NULL, 'STOCK', 'Bronce', 'Collar', 'Collar Andino de Bronce', 2, 35.00, 3.0, 0, 'en_proceso');

-- ================================================
-- COMENTARIOS
-- ================================================
COMMENT ON TABLE produccion_taller IS 'Registro de fabricación - SOLO costos, NO precios de venta';
COMMENT ON COLUMN produccion_taller.pedido_id IS 'Si tiene valor = producción por pedido, si NULL = producción para stock';
COMMENT ON COLUMN produccion_taller.tipo_produccion IS 'PEDIDO o STOCK - define el flujo';
COMMENT ON VIEW v_produccion_con_precios IS 'Vista calculada - ganancias NO guardadas, solo calculadas al consultar';

-- ================================================
-- RESUMEN
-- ================================================
-- ✅ Producción solo guarda COSTOS
-- ✅ Precio de venta viene de PEDIDOS
-- ✅ Ganancia se CALCULA, no se guarda
-- ✅ Tipo PEDIDO enlaza a tabla pedidos
-- ✅ Tipo STOCK es producción independiente

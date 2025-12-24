-- ========================================
-- AGREGAR CAMPOS DE INVENTARIADO
-- ========================================
-- Script para agregar campos de control de inventariado
-- a la tabla compras_items

-- 1. Agregar campo inventariado
ALTER TABLE compras_items 
ADD COLUMN IF NOT EXISTS inventariado BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN compras_items.inventariado IS 'Indica si el item ya fue agregado al inventario';

-- 2. Agregar campo producto_inventario_id
ALTER TABLE compras_items 
ADD COLUMN IF NOT EXISTS producto_inventario_id UUID REFERENCES productos(id) ON DELETE SET NULL;

COMMENT ON COLUMN compras_items.producto_inventario_id IS 'Referencia al producto creado en inventario';

-- 3. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_compras_items_inventariado 
ON compras_items(inventariado);

CREATE INDEX IF NOT EXISTS idx_compras_items_producto_inv 
ON compras_items(producto_inventario_id);

-- 4. Actualizar items existentes (si los hay)
-- Por defecto, todos los items existentes se marcan como NO inventariados
UPDATE compras_items 
SET inventariado = FALSE 
WHERE inventariado IS NULL;

-- Verificación
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'compras_items' 
ORDER BY ordinal_position;

-- Mostrar resumen
SELECT 
    COUNT(*) as total_items,
    COUNT(CASE WHEN inventariado = TRUE THEN 1 END) as items_inventariados,
    COUNT(CASE WHEN inventariado = FALSE THEN 1 END) as items_pendientes
FROM compras_items;

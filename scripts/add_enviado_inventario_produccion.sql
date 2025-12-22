-- Agregar columna enviado_a_inventario a tabla produccion
-- Esta columna permite rastrear si un producto terminado ya fue enviado al inventario

ALTER TABLE produccion 
ADD COLUMN IF NOT EXISTS enviado_a_inventario BOOLEAN DEFAULT FALSE;

-- Comentario en la columna para documentación
COMMENT ON COLUMN produccion.enviado_a_inventario IS 'Indica si el producto terminado ya fue enviado al inventario';

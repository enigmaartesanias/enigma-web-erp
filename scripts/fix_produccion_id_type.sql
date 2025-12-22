-- ================================================
-- FIX: Cambiar tipo de columna produccion_id
-- De INTEGER a TEXT para soportar UUID
-- ================================================

-- 1. Eliminar la columna existente (si tiene datos, se perderán)
ALTER TABLE productos_externos
DROP COLUMN IF EXISTS produccion_id;

-- 2. Agregar la columna con tipo TEXT para soportar UUID
ALTER TABLE productos_externos
ADD COLUMN produccion_id TEXT;

-- 3. Hacer lo mismo para producto_externo_id en produccion_taller
ALTER TABLE produccion_taller
DROP COLUMN IF EXISTS producto_externo_id;

ALTER TABLE produccion_taller
ADD COLUMN producto_externo_id TEXT;

-- 4. Recrear índices
DROP INDEX IF EXISTS idx_producto_externo_produccion;
DROP INDEX IF EXISTS idx_produccion_producto_externo;

CREATE INDEX idx_producto_externo_produccion ON productos_externos(produccion_id);
CREATE INDEX idx_produccion_producto_externo ON produccion_taller(producto_externo_id);

-- 5. Actualizar comentarios
COMMENT ON COLUMN productos_externos.produccion_id IS 'ID de producción origen (UUID o INTEGER según schema)';
COMMENT ON COLUMN produccion_taller.producto_externo_id IS 'ID del producto creado en inventario (UUID o INTEGER según schema)';

-- ================================================
-- VERIFICACIÓN
-- ================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'productos_externos'
  AND column_name = 'produccion_id';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'produccion_taller'
  AND column_name = 'producto_externo_id';

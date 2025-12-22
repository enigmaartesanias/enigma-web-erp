-- ================================================
-- MIGRACIÓN: Agregar campos para transferencia
-- Producción → Inventario
-- ================================================
-- VERSIÓN SIMPLIFICADA - Sin foreign keys explícitas para evitar errores

-- 1. Agregar columnas a productos_externos
ALTER TABLE productos_externos
ADD COLUMN IF NOT EXISTS produccion_id INTEGER;

-- 2. Agregar columnas a produccion_taller
ALTER TABLE produccion_taller
ADD COLUMN IF NOT EXISTS transferido_inventario BOOLEAN DEFAULT FALSE;

ALTER TABLE produccion_taller
ADD COLUMN IF NOT EXISTS fecha_transferencia TIMESTAMP;

ALTER TABLE produccion_taller
ADD COLUMN IF NOT EXISTS producto_externo_id INTEGER;

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_produccion_transferido ON produccion_taller(transferido_inventario);
CREATE INDEX IF NOT EXISTS idx_produccion_producto_externo ON produccion_taller(producto_externo_id);
CREATE INDEX IF NOT EXISTS idx_producto_externo_produccion ON productos_externos(produccion_id);

-- 4. Comentarios
COMMENT ON COLUMN produccion_taller.transferido_inventario IS 'Indica si el producto fue transferido a inventario';
COMMENT ON COLUMN produccion_taller.fecha_transferencia IS 'Fecha y hora de transferencia a inventario';
COMMENT ON COLUMN produccion_taller.producto_externo_id IS 'ID del producto creado en inventario';
COMMENT ON COLUMN productos_externos.produccion_id IS 'ID de producción origen (si aplica)';

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Ver estructura actualizada de produccion_taller
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'produccion_taller'
  AND column_name IN ('transferido_inventario', 'fecha_transferencia', 'producto_externo_id')
ORDER BY ordinal_position;

-- Ver estructura actualizada de productos_externos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'productos_externos'
  AND column_name = 'produccion_id';


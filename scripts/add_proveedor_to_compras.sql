-- Script para agregar columna proveedor_id a la tabla compras
-- Ejecutar en Neon Database Console

-- 1. Agregar columna proveedor_id (UUID, nullable)
ALTER TABLE compras 
ADD COLUMN IF NOT EXISTS proveedor_id UUID;

-- 2. Crear índice para mejorar performance en consultas
CREATE INDEX IF NOT EXISTS idx_compras_proveedor_id 
ON compras(proveedor_id);

-- 3. Agregar comentario descriptivo
COMMENT ON COLUMN compras.proveedor_id IS 'ID del proveedor asociado a esta compra';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'compras' 
AND column_name = 'proveedor_id';

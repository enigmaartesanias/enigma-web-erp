-- ========================================
-- FIX: Agregar columna 'activo' a proveedores
-- ========================================
-- La columna activo faltaba en la tabla proveedores

-- Agregar columna activo si no existe
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Actualizar registros existentes para que estén activos
UPDATE proveedores 
SET activo = TRUE 
WHERE activo IS NULL;

-- Verificación
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'proveedores' 
AND column_name = 'activo';

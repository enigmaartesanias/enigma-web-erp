-- ========================================
-- FIX: Agregar columnas faltantes a proveedores
-- ========================================
-- Este script agrega las columnas telefono y direccion si no existen

-- Agregar columna telefono si no existe
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);

-- Agregar columna direccion si no existe
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Verificar las columnas de la tabla
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'proveedores' 
ORDER BY ordinal_position;

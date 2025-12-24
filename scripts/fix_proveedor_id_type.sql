-- Script para verificar y corregir el tipo de dato de proveedor_id
-- Ejecutar en Neon Database Console

-- 1. Verificar tipo de ID en tabla proveedores
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'proveedores' 
AND column_name = 'id';

-- 2. Verificar tipo de proveedor_id en tabla compras
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'compras' 
AND column_name = 'proveedor_id';

-- 3. Si proveedores.id es INTEGER y compras.proveedor_id es UUID, 
--    necesitamos cambiar compras.proveedor_id a INTEGER

-- EJECUTAR SOLO SI ES NECESARIO:
-- Primero eliminar la columna UUID
-- ALTER TABLE compras DROP COLUMN IF EXISTS proveedor_id;

-- Luego agregar como INTEGER
-- ALTER TABLE compras ADD COLUMN proveedor_id INTEGER;

-- Crear foreign key
-- ALTER TABLE compras 
-- ADD CONSTRAINT fk_compras_proveedor 
-- FOREIGN KEY (proveedor_id) 
-- REFERENCES proveedores(id) 
-- ON DELETE SET NULL;

-- Crear índice
-- CREATE INDEX IF NOT EXISTS idx_compras_proveedor_id ON compras(proveedor_id);

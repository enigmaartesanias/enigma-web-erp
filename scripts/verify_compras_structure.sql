-- Script para verificar la estructura actual de la tabla compras
-- Ejecutar en Neon Database Console

-- Ver todas las columnas de la tabla compras
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'compras'
ORDER BY ordinal_position;

-- Ver las constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'compras';

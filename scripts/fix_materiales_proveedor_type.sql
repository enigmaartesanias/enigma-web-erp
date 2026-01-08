-- Script para corregir el tipo de datos de proveedor_id en materiales_compras
-- El problema: proveedor_id es UUID pero proveedores.id es INTEGER

-- Paso 1: Eliminar la constraint de foreign key si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'materiales_compras_proveedor_id_fkey'
        AND table_name = 'materiales_compras'
    ) THEN
        ALTER TABLE materiales_compras 
        DROP CONSTRAINT materiales_compras_proveedor_id_fkey;
    END IF;
END $$;

-- Paso 2: Cambiar el tipo de la columna proveedor_id de UUID a INTEGER
-- Primero establecer valores NULL para todos los registros porque no se puede convertir UUID a INTEGER directamente
UPDATE materiales_compras SET proveedor_id = NULL::uuid;

-- Ahora cambiar el tipo de columna
ALTER TABLE materiales_compras 
ALTER COLUMN proveedor_id TYPE INTEGER 
USING NULL::INTEGER;

-- Paso 3: Recrear la foreign key constraint
ALTER TABLE materiales_compras
ADD CONSTRAINT materiales_compras_proveedor_id_fkey 
FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);

-- Verificación
SELECT 
    'materiales_compras.proveedor_id' as columna,
    data_type
FROM information_schema.columns 
WHERE table_name = 'materiales_compras' 
AND column_name = 'proveedor_id';

SELECT 
    'proveedores.id' as columna,
    data_type
FROM information_schema.columns 
WHERE table_name = 'proveedores' 
AND column_name = 'id';

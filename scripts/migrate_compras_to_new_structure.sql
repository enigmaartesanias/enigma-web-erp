-- ========================================
-- MIGRAR ESTRUCTURA DE COMPRAS
-- ========================================
-- Este script actualiza la tabla compras para el nuevo flujo

-- 1. Agregar columna tipo_item
ALTER TABLE compras 
ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(50);

COMMENT ON COLUMN compras.tipo_item IS 'Tipo de item: MATERIAL, PRODUCTO_TERMINADO, NUEVO_MATERIAL';

-- 2. Agregar columna proveedor_id (UUID)
ALTER TABLE compras 
ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);

-- 3. Migrar datos existentes de proveedor (texto) a proveedores (tabla)
-- NOTA: Solo ejecutar si ya tienes datos en la tabla compras
DO $$
DECLARE
    compra_record RECORD;
    proveedor_id_var UUID;
BEGIN
    -- Iterar sobre compras que tienen proveedor (texto)
    FOR compra_record IN 
        SELECT id, proveedor 
        FROM compras 
        WHERE proveedor IS NOT NULL AND proveedor != ''
    LOOP
        -- Buscar o crear proveedor
        SELECT id INTO proveedor_id_var
        FROM proveedores
        WHERE LOWER(nombre) = LOWER(compra_record.proveedor)
        LIMIT 1;
        
        -- Si no existe, crearlo
        IF proveedor_id_var IS NULL THEN
            INSERT INTO proveedores (nombre)
            VALUES (compra_record.proveedor)
            RETURNING id INTO proveedor_id_var;
        END IF;
        
        -- Actualizar compra con el proveedor_id
        UPDATE compras
        SET proveedor_id = proveedor_id_var
        WHERE id = compra_record.id;
    END LOOP;
    
    RAISE NOTICE 'Migración de proveedores completada';
END $$;

-- 4. Opcional: Eliminar columna proveedor antigua (texto)
-- DESCOMENTAR SOLO SI ESTÁS SEGURO DE QUE LA MIGRACIÓN FUNCIONÓ
-- ALTER TABLE compras DROP COLUMN IF EXISTS proveedor;

-- 5. Hacer que tipo_compra sea opcional (ahora usamos tipo_item)
ALTER TABLE compras 
ALTER COLUMN tipo_compra DROP NOT NULL;

-- Verificación
SELECT 
    COUNT(*) as total_compras,
    COUNT(proveedor_id) as con_proveedor_id,
    COUNT(proveedor) as con_proveedor_texto
FROM compras;

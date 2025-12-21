-- ========================================
-- FIX: Cambiar producto_id de integer a UUID en tabla compras
-- ========================================
-- Este script corrige el error al guardar compras de tipo PRODUCTO
-- Problema: producto_id era integer pero productos_externos.id es UUID

-- Verificar si hay datos en producto_id antes de modificar
DO $$
BEGIN
    RAISE NOTICE 'Verificando datos existentes en producto_id...';
END $$;

SELECT COUNT(*) as registros_con_producto 
FROM compras 
WHERE producto_id IS NOT NULL;

-- 1. Eliminar la columna producto_id existente
ALTER TABLE compras 
DROP COLUMN IF EXISTS producto_id;

-- 2. Agregar nueva columna producto_id de tipo UUID
ALTER TABLE compras 
ADD COLUMN producto_id UUID;

-- 3. Agregar foreign key constraint hacia productos_externos
ALTER TABLE compras 
ADD CONSTRAINT fk_compras_producto 
FOREIGN KEY (producto_id) 
REFERENCES productos_externos(id) 
ON DELETE SET NULL;

-- 4. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_compras_producto 
ON compras(producto_id);

-- 5. Agregar comentario
COMMENT ON COLUMN compras.producto_id IS 'Referencia al producto en productos_externos (solo para tipo_compra = PRODUCTO)';

-- Verificación
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'compras' 
AND column_name = 'producto_id';

-- =====================================================
-- Agregar campo fecha_entrega a tabla pedidos
-- =====================================================

-- 1. Agregar columna
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP;

-- 2. Agregar comentario
COMMENT ON COLUMN pedidos.fecha_entrega IS 
'Fecha y hora en que se marcó el pedido como entregado';

-- 3. Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_entrega 
ON pedidos(fecha_entrega) 
WHERE fecha_entrega IS NOT NULL;

-- 4. Verificar
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND column_name = 'fecha_entrega';

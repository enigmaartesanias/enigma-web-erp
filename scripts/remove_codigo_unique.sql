-- Quitar restricción UNIQUE de codigo_usuario para permitir duplicados
-- Esto permite agrupar productos por modelo usando el mismo código

ALTER TABLE productos_externos DROP CONSTRAINT IF EXISTS productos_externos_codigo_usuario_key;

-- El índice se mantiene para búsquedas rápidas, pero sin restricción de unicidad

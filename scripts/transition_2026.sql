-- Script de Transición al Año 2026
-- 1. Agregar columna 'estado_activo' a la tabla de productos si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS estado_activo BOOLEAN DEFAULT TRUE;

-- 2. "Archivar" el inventario antiguo (creado antes del 2026)
-- Esto no borra los datos, solo los marca como inactivos para que no salgan en nuevos pedidos
UPDATE productos 
SET estado_activo = FALSE 
WHERE created_at < '2026-01-01 00:00:00';

-- 3. Verificación (Opcional)
-- SELECT count(*) as productos_archivados FROM productos WHERE estado_activo = FALSE;

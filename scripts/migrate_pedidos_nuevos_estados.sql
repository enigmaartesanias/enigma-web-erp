-- ============================================================
-- MIGRACIÓN: Sistema de Pedidos - Nuevos Estados
-- Fecha: 2025-12-19
-- Descripción: Agrega campos estado_pedido y estado_produccion
-- ============================================================

-- 1. Agregar nuevos campos a la tabla pedidos
ALTER TABLE pedidos 
  ADD COLUMN IF NOT EXISTS estado_pedido VARCHAR(20) DEFAULT 'aceptado',
  ADD COLUMN IF NOT EXISTS estado_produccion VARCHAR(20) DEFAULT 'no_iniciado';

-- 2. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pedido ON pedidos(estado_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_produccion ON pedidos(estado_produccion);

-- 3. Agregar constraints para validar valores
ALTER TABLE pedidos 
  DROP CONSTRAINT IF EXISTS chk_estado_pedido;

ALTER TABLE pedidos 
  ADD CONSTRAINT chk_estado_pedido 
  CHECK (estado_pedido IN ('aceptado', 'entregado'));

ALTER TABLE pedidos 
  DROP CONSTRAINT IF EXISTS chk_estado_produccion;

ALTER TABLE pedidos 
  ADD CONSTRAINT chk_estado_produccion 
  CHECK (estado_produccion IN ('no_iniciado', 'en_proceso', 'terminado'));

-- 4. Agregar comentarios para documentación
COMMENT ON COLUMN pedidos.estado_pedido IS 'Estado comercial: aceptado (activo), entregado (bloqueado)';
COMMENT ON COLUMN pedidos.estado_produccion IS 'Estado del taller: no_iniciado, en_proceso, terminado';

-- 5. Migrar datos existentes según la nueva lógica
UPDATE pedidos 
SET 
  estado_pedido = CASE 
    WHEN entregado = TRUE THEN 'entregado'
    ELSE 'aceptado'
  END,
  estado_produccion = CASE 
    -- Si existe en producción y está terminado
    WHEN EXISTS (
      SELECT 1 FROM produccion_taller pt 
      WHERE pt.pedido_id = id_pedido 
      AND pt.estado_produccion = 'terminado'
    ) THEN 'terminado'
    -- Si existe en producción y está en proceso
    WHEN EXISTS (
      SELECT 1 FROM produccion_taller pt 
      WHERE pt.pedido_id = id_pedido 
      AND pt.estado_produccion IN ('en_proceso', 'proceso')
    ) THEN 'en_proceso'
    -- Por defecto, no iniciado
    ELSE 'no_iniciado'
  END
WHERE estado_pedido IS NULL OR estado_produccion IS NULL;

-- 6. IMPORTANTE: Revisar pedidos que antes estaban "cancelados"
-- Estos deben ELIMINARSE manualmente según decisión de negocio
-- DESCOMENTAR LA SIGUIENTE LÍNEA SOLO DESPUÉS DE REVISAR:
-- DELETE FROM pedidos WHERE cancelado = TRUE;

-- 7. Verificar migración
SELECT 
  estado_pedido,
  estado_produccion,
  COUNT(*) as total
FROM pedidos
GROUP BY estado_pedido, estado_produccion
ORDER BY estado_pedido, estado_produccion;

-- 8. Mostrar resumen
SELECT 
  'Total de pedidos' as descripcion,
  COUNT(*) as cantidad
FROM pedidos
UNION ALL
SELECT 
  'Pedidos aceptados' as descripcion,
  COUNT(*) as cantidad
FROM pedidos WHERE estado_pedido = 'aceptado'
UNION ALL
SELECT 
  'Pedidos entregados' as descripcion,
  COUNT(*) as cantidad
FROM pedidos WHERE estado_pedido = 'entregado'
UNION ALL
SELECT 
  'Producción no iniciada' as descripcion,
  COUNT(*) as cantidad
FROM pedidos WHERE estado_produccion = 'no_iniciado'
UNION ALL
SELECT 
  'Producción en proceso' as descripcion,
  COUNT(*) as cantidad
FROM pedidos WHERE estado_produccion = 'en_proceso'
UNION ALL
SELECT 
  'Producción terminada' as descripcion,
  COUNT(*) as cantidad
FROM pedidos WHERE estado_produccion = 'terminado';

-- =====================================================
-- Trigger para sincronizar estado_produccion
-- Mantiene pedidos.estado_produccion sincronizado con
-- el estado agregado de todos los items de producción
-- =====================================================

-- 1. Crear función que calcula el estado agregado
CREATE OR REPLACE FUNCTION sync_estado_produccion()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estado del pedido basado en items de producción
  UPDATE pedidos 
  SET estado_produccion = (
    SELECT CASE 
      -- Si todos están terminados
      WHEN COUNT(*) = COUNT(*) FILTER (WHERE estado_produccion = 'terminado')
        THEN 'terminado'
      
      -- Si al menos uno está en proceso
      WHEN COUNT(*) FILTER (WHERE estado_produccion = 'en_proceso') > 0
        THEN 'en_proceso'
      
      -- Si todos están no iniciados
      ELSE 'no_iniciado'
    END
    FROM produccion_taller
    WHERE id_pedido = COALESCE(NEW.id_pedido, OLD.id_pedido)
  )
  WHERE id_pedido = COALESCE(NEW.id_pedido, OLD.id_pedido);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Crear trigger en INSERT/UPDATE/DELETE
DROP TRIGGER IF EXISTS trigger_sync_estado_produccion ON produccion_taller;

CREATE TRIGGER trigger_sync_estado_produccion
AFTER INSERT OR UPDATE OR DELETE ON produccion_taller
FOR EACH ROW
EXECUTE FUNCTION sync_estado_produccion();

-- 3. Verificar instalación
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_sync_estado_produccion';

-- 4. Prueba rápida (opcional)
-- SELECT 
--   p.id_pedido,
--   p.estado_produccion as estado_pedido,
--   COUNT(*) as total_items,
--   COUNT(*) FILTER (WHERE pt.estado_produccion = 'terminado') as terminados,
--   COUNT(*) FILTER (WHERE pt.estado_produccion = 'en_proceso') as en_proceso,
--   COUNT(*) FILTER (WHERE pt.estado_produccion = 'no_iniciado') as no_iniciados
-- FROM pedidos p
-- LEFT JOIN produccion_taller pt ON p.id_pedido = pt.id_pedido
-- GROUP BY p.id_pedido, p.estado_produccion;

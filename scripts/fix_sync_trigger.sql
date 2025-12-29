-- =====================================================
-- FIX: Trigger de sincronización corregido
-- Maneja correctamente INSERT con id_pedido NULL
-- =====================================================

-- 1. Actualizar función con validación
CREATE OR REPLACE FUNCTION sync_estado_produccion()
RETURNS TRIGGER AS $$
DECLARE
  v_id_pedido INT;
BEGIN
  -- Obtener id_pedido (NEW para INSERT/UPDATE, OLD para DELETE)
  v_id_pedido := COALESCE(NEW.id_pedido, OLD.id_pedido);
  
  -- Solo proceder si hay un id_pedido válido
  IF v_id_pedido IS NOT NULL THEN
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
      WHERE id_pedido = v_id_pedido
    )
    WHERE id_pedido = v_id_pedido;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Recrear trigger
DROP TRIGGER IF EXISTS trigger_sync_estado_produccion ON produccion_taller;

CREATE TRIGGER trigger_sync_estado_produccion
AFTER INSERT OR UPDATE OR DELETE ON produccion_taller
FOR EACH ROW
EXECUTE FUNCTION sync_estado_produccion();

-- 3. Verificar
SELECT 'Trigger corregido y reinstalado' as status;

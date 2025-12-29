-- =====================================================
-- FIX FINAL: Trigger de sincronización con pedido_id
-- (La columna en la BD se llama pedido_id, no id_pedido)
-- =====================================================

-- 1. Actualizar función con el nombre correcto de columna
CREATE OR REPLACE FUNCTION sync_estado_produccion()
RETURNS TRIGGER AS $$
DECLARE
  v_pedido_id INT;
BEGIN
  -- Obtener pedido_id (NEW para INSERT/UPDATE, OLD para DELETE)
  v_pedido_id := COALESCE(NEW.pedido_id, OLD.pedido_id);
  
  -- Solo proceder si hay un pedido_id válido
  IF v_pedido_id IS NOT NULL THEN
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
        
        -- Si todos están no iniciados o pendientes
        ELSE 'no_iniciado'
      END
      FROM produccion_taller
      WHERE pedido_id = v_pedido_id
    )
    WHERE id_pedido = v_pedido_id;
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
SELECT 'Trigger corregido con pedido_id' as status;

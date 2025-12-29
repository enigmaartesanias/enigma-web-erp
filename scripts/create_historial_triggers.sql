-- =====================================================
-- Triggers para registrar cambios en historial
-- Auditoría automática de cambios de estado
-- =====================================================

-- 1. Función para registrar cambios en pedidos
CREATE OR REPLACE FUNCTION audit_pedidos()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar cambio de estado_pedido
  IF OLD.estado_pedido IS DISTINCT FROM NEW.estado_pedido THEN
    INSERT INTO historial_estados (
      id_pedido, tabla_origen, campo_modificado, 
      valor_anterior, valor_nuevo
    ) VALUES (
      NEW.id_pedido, 'pedidos', 'estado_pedido',
      OLD.estado_pedido, NEW.estado_pedido
    );
  END IF;
  
  -- Registrar cambio de estado_produccion
  IF OLD.estado_produccion IS DISTINCT FROM NEW.estado_produccion THEN
    INSERT INTO historial_estados (
      id_pedido, tabla_origen, campo_modificado,
      valor_anterior, valor_nuevo
    ) VALUES (
      NEW.id_pedido, 'pedidos', 'estado_produccion',
      OLD.estado_produccion, NEW.estado_produccion
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para registrar cambios en producción
CREATE OR REPLACE FUNCTION audit_produccion()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar cambio de estado_produccion
  IF OLD.estado_produccion IS DISTINCT FROM NEW.estado_produccion THEN
    INSERT INTO historial_estados (
      id_pedido, tabla_origen, campo_modificado,
      valor_anterior, valor_nuevo,
      notas
    ) VALUES (
      NEW.id_pedido, 'produccion_taller', 'estado_produccion',
      OLD.estado_produccion, NEW.estado_produccion,
      'Item: ' || NEW.nombre_producto
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear triggers
DROP TRIGGER IF EXISTS trigger_audit_pedidos ON pedidos;
DROP TRIGGER IF EXISTS trigger_audit_produccion ON produccion_taller;

CREATE TRIGGER trigger_audit_pedidos
AFTER UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION audit_pedidos();

CREATE TRIGGER trigger_audit_produccion
AFTER UPDATE ON produccion_taller
FOR EACH ROW
EXECUTE FUNCTION audit_produccion();

-- 4. Verificar instalación
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('trigger_audit_pedidos', 'trigger_audit_produccion')
ORDER BY event_object_table;

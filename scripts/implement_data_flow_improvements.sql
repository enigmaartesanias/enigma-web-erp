-- =====================================================
-- Script Maestro: Implementación de Mejoras al Flujo
-- Ejecutar en Neon DB en este orden
-- =====================================================

-- PASO 1: Crear tabla de historial
-- =====================================================
CREATE TABLE IF NOT EXISTS historial_estados (
  id_historial SERIAL PRIMARY KEY,
  id_pedido INT NOT NULL REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  tabla_origen VARCHAR(50) NOT NULL,
  campo_modificado VARCHAR(50) NOT NULL,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario VARCHAR(100),
  notas TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_pedido ON historial_estados(id_pedido);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_estados(fecha_cambio DESC);
CREATE INDEX IF NOT EXISTS idx_historial_tabla ON historial_estados(tabla_origen);

COMMENT ON TABLE historial_estados IS 'Registro de auditoría de todos los cambios de estado';

-- PASO 2: Crear función de sincronización
-- =====================================================
CREATE OR REPLACE FUNCTION sync_estado_produccion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE pedidos 
  SET estado_produccion = (
    SELECT CASE 
      WHEN COUNT(*) = COUNT(*) FILTER (WHERE estado_produccion = 'terminado')
        THEN 'terminado'
      WHEN COUNT(*) FILTER (WHERE estado_produccion = 'en_proceso') > 0
        THEN 'en_proceso'
      ELSE 'no_iniciado'
    END
    FROM produccion_taller
    WHERE id_pedido = COALESCE(NEW.id_pedido, OLD.id_pedido)
  )
  WHERE id_pedido = COALESCE(NEW.id_pedido, OLD.id_pedido);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- PASO 3: Crear trigger de sincronización
-- =====================================================
DROP TRIGGER IF EXISTS trigger_sync_estado_produccion ON produccion_taller;

CREATE TRIGGER trigger_sync_estado_produccion
AFTER INSERT OR UPDATE OR DELETE ON produccion_taller
FOR EACH ROW
EXECUTE FUNCTION sync_estado_produccion();

-- PASO 4: Crear funciones de auditoría
-- =====================================================
CREATE OR REPLACE FUNCTION audit_pedidos()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado_pedido IS DISTINCT FROM NEW.estado_pedido THEN
    INSERT INTO historial_estados (
      id_pedido, tabla_origen, campo_modificado, 
      valor_anterior, valor_nuevo
    ) VALUES (
      NEW.id_pedido, 'pedidos', 'estado_pedido',
      OLD.estado_pedido, NEW.estado_pedido
    );
  END IF;
  
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

CREATE OR REPLACE FUNCTION audit_produccion()
RETURNS TRIGGER AS $$
BEGIN
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

-- PASO 5: Crear triggers de auditoría
-- =====================================================
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

-- VERIFICACIÓN FINAL
-- =====================================================
SELECT '✅ Tabla historial_estados creada' as status
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'historial_estados'
);

SELECT '✅ Triggers creados: ' || COUNT(*) as status
FROM information_schema.triggers
WHERE trigger_name IN (
  'trigger_sync_estado_produccion',
  'trigger_audit_pedidos',
  'trigger_audit_produccion'
);

SELECT '✅ Implementación completada' as status;

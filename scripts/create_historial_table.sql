-- =====================================================
-- Tabla de historial para auditoría completa
-- Registra todos los cambios de estado en el sistema
-- =====================================================

-- 1. Crear tabla
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

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_historial_pedido 
ON historial_estados(id_pedido);

CREATE INDEX IF NOT EXISTS idx_historial_fecha 
ON historial_estados(fecha_cambio DESC);

CREATE INDEX IF NOT EXISTS idx_historial_tabla 
ON historial_estados(tabla_origen);

-- 3. Agregar comentarios
COMMENT ON TABLE historial_estados IS 
'Registro de auditoría de todos los cambios de estado en pedidos y producción';

COMMENT ON COLUMN historial_estados.tabla_origen IS 
'Tabla donde ocurrió el cambio (pedidos, produccion_taller)';

COMMENT ON COLUMN historial_estados.campo_modificado IS 
'Campo que fue modificado (estado_pedido, estado_produccion, etc)';

COMMENT ON COLUMN historial_estados.valor_anterior IS 
'Valor del campo antes del cambio';

COMMENT ON COLUMN historial_estados.valor_nuevo IS 
'Valor del campo después del cambio';

-- 4. Verificar instalación
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'historial_estados'
ORDER BY ordinal_position;

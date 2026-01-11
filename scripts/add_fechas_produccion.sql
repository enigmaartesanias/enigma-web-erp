-- Agregar columnas de control de tiempos a produccion_taller
-- Fecha: 2026-01-11

-- 1. Agregar columnas
ALTER TABLE produccion_taller 
ADD COLUMN IF NOT EXISTS fecha_inicio_produccion DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_produccion DATE;

-- 2. Migrar datos históricos (Seguridad)
-- Asumimos que la fecha_produccion registrada fue la fecha de inicio
UPDATE produccion_taller 
SET fecha_inicio_produccion = fecha_produccion 
WHERE fecha_inicio_produccion IS NULL;

-- Para registros ya terminados, asumimos que se terminaron en la misma fecha (aprox) 
-- o usamos updated_at si es reciente, pero por consistencia histórica usaremos fecha_produccion
UPDATE produccion_taller 
SET fecha_fin_produccion = fecha_produccion 
WHERE estado_produccion = 'terminado' AND fecha_fin_produccion IS NULL;

-- 3. Crear índices para reportes rápidos
CREATE INDEX IF NOT EXISTS idx_produccion_fecha_inicio ON produccion_taller(fecha_inicio_produccion);
CREATE INDEX IF NOT EXISTS idx_produccion_fecha_fin ON produccion_taller(fecha_fin_produccion);

-- 4. Comentarios
COMMENT ON COLUMN produccion_taller.fecha_inicio_produccion IS 'Fecha real cuando inició el trabajo en taller';
COMMENT ON COLUMN produccion_taller.fecha_fin_produccion IS 'Fecha real cuando se terminó el trabajo (estado terminado)';

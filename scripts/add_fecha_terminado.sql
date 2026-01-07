-- ================================================
-- FIX: Agregar columna faltante fecha_terminado
-- ================================================

ALTER TABLE produccion_taller 
ADD COLUMN IF NOT EXISTS fecha_terminado TIMESTAMP;

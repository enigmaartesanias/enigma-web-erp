-- Actualización de Base de Datos para Correlativos de Producción
ALTER TABLE produccion_taller ADD COLUMN IF NOT EXISTS codigo_correlativo VARCHAR(20);

-- Poblar registros existentes con formato PR-0001, PR-0002, etc.
UPDATE produccion_taller 
SET codigo_correlativo = 'PR-' || LPAD(id_produccion::text, 4, '0')
WHERE codigo_correlativo IS NULL;

-- Asegurar que productos_externos tenga el campo para guardar este vínculo si no queremos usar solo el ID
-- Aunque ya tiene produccion_id, podemos agregar codigo_produccion_origen para facilitar la vista
ALTER TABLE productos_externos ADD COLUMN IF NOT EXISTS codigo_produccion_origen VARCHAR(20);

-- Actualizar productos_externos existentes vinculados a producción
UPDATE productos_externos pe
SET codigo_produccion_origen = pt.codigo_correlativo
FROM produccion_taller pt
WHERE pe.produccion_id = pt.id_produccion
AND pe.codigo_produccion_origen IS NULL;

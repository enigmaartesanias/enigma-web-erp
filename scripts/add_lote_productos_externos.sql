-- Add lote column
ALTER TABLE productos_externos
ADD COLUMN IF NOT EXISTS lote VARCHAR(20);

-- Create index for faster prefix/lote search
CREATE INDEX IF NOT EXISTS idx_productos_externos_lote 
ON productos_externos(lote);

COMMENT ON COLUMN productos_externos.lote IS 'Identificador de lote (ej: L001) para agrupar inventario';

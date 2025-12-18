-- Agregar columna forma_pago a la tabla ventas
ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS forma_pago VARCHAR(20) DEFAULT 'Efectivo';

-- Comentario informativo
COMMENT ON COLUMN ventas.forma_pago IS 'Método de pago utilizado: Efectivo, Yape, Plin, Transferencia';

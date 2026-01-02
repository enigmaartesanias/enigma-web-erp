-- Agregar campos de fechas de pago y cancelación a la tabla ventas

ALTER TABLE ventas 
ADD COLUMN IF NOT EXISTS fecha_ultimo_pago TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_cancelacion TIMESTAMP;

-- Comentarios para documentar
COMMENT ON COLUMN ventas.fecha_ultimo_pago IS 'Fecha del último pago registrado para ventas a crédito';
COMMENT ON COLUMN ventas.fecha_cancelacion IS 'Fecha en que se canceló completamente el crédito (saldo_pendiente = 0)';

ALTER TABLE detalles_pedido ADD COLUMN IF NOT EXISTS metal VARCHAR(100);
ALTER TABLE detalles_pedido ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(100);

COMMENT ON COLUMN detalles_pedido.metal IS 'Metal del producto (Oro, Plata, etc.)';
COMMENT ON COLUMN detalles_pedido.tipo_producto IS 'Tipo de producto (Anillo, Pulsera, etc.)';

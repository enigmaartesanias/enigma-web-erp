-- ========================================
-- CREAR TABLA: compras_items
-- ========================================
-- Tabla para almacenar items individuales de cada compra
-- Permite registrar múltiples items en una sola compra

CREATE TABLE IF NOT EXISTS compras_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    nombre_item VARCHAR(255) NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    costo_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    producto_externo_id UUID REFERENCES productos_externos(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_compras_items_compra ON compras_items(compra_id);
CREATE INDEX IF NOT EXISTS idx_compras_items_producto ON compras_items(producto_externo_id);

-- Comentario
COMMENT ON TABLE compras_items IS 'Detalle de items por compra (permite múltiples items por compra)';
COMMENT ON COLUMN compras_items.producto_externo_id IS 'Referencia al producto si es un item de inventario';

-- Verificación
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'compras_items' 
ORDER BY ordinal_position;

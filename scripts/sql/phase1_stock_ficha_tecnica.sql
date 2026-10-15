-- ==============================================================================
-- FASE 1: Estructura de Base de Datos y Políticas RLS para Stock Inmediato y Ficha Técnica
-- Proyecto: Enigma Web ERP (Supabase ID: qwvhrtdddpmaovnyarhr)
-- ==============================================================================

-- 1. Añadir columnas para Stock Inmediato y Ficha Técnica (si no existen)
ALTER TABLE productos 
  ADD COLUMN IF NOT EXISTS is_ready_to_ship BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_offer NUMERIC(10, 2) NULL,
  ADD COLUMN IF NOT EXISTS weight_grams NUMERIC(6, 2) NULL,
  ADD COLUMN IF NOT EXISTS dimensions TEXT NULL,
  ADD COLUMN IF NOT EXISTS material TEXT NULL,
  ADD COLUMN IF NOT EXISTS process_technique TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_info TEXT DEFAULT 'Envíos a todo el Perú por Shalom y Olva Courier.',
  ADD COLUMN IF NOT EXISTS payment_info TEXT DEFAULT 'Aceptamos Yape, Plin y Transferencias BCP / Interbank.',
  ADD COLUMN IF NOT EXISTS custom_order_terms TEXT DEFAULT 'Piezas bajo encargo: Elaboración con el 80% de adelanto (Tiempo de taller: 4-6 días hábiles).',
  ADD COLUMN IF NOT EXISTS short_description VARCHAR(160) NULL;

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- 3. Limpieza preventiva de políticas para garantizar idempotencia (no arroja error si ya existen)
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON productos;
DROP POLICY IF EXISTS "Permitir insertar productos" ON productos;
DROP POLICY IF EXISTS "Permitir actualizar productos" ON productos;
DROP POLICY IF EXISTS "Permitir eliminar productos" ON productos;

-- 4. Creación de políticas de acceso CRUD
CREATE POLICY "Permitir lectura pública de productos" 
  ON productos FOR SELECT 
  USING (true);

CREATE POLICY "Permitir insertar productos" 
  ON productos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar productos" 
  ON productos FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Permitir eliminar productos" 
  ON productos FOR DELETE 
  USING (true);

-- 5. MEJORAS ADICIONALES (Optimización para el Grid de 2 columnas en Home):
-- Índices para acelerar el filtrado de productos con stock inmediato activos
CREATE INDEX IF NOT EXISTS idx_productos_ready_to_ship 
  ON productos (is_ready_to_ship) 
  WHERE activo = true;

CREATE INDEX IF NOT EXISTS idx_productos_stock_quantity 
  ON productos (stock_quantity);

-- 6. Comentarios de documentación en el esquema de PostgreSQL
COMMENT ON COLUMN productos.is_ready_to_ship IS 'Indica si el producto cuenta con stock inmediato listo para envío';
COMMENT ON COLUMN productos.stock_quantity IS 'Cantidad disponible en almacén para despacho inmediato';
COMMENT ON COLUMN productos.price_offer IS 'Precio con descuento / oferta promocional en soles';
COMMENT ON COLUMN productos.weight_grams IS 'Peso en gramos de la pieza terminada para la ficha técnica';
COMMENT ON COLUMN productos.dimensions IS 'Medidas o dimensiones (ej. 3.5 cm x 2.0 cm)';
COMMENT ON COLUMN productos.material IS 'Material principal o aleación descrita en la ficha técnica';
COMMENT ON COLUMN productos.process_technique IS 'Técnica artesanal de elaboración (ej. Filigrana, forjado manual)';
COMMENT ON COLUMN productos.shipping_info IS 'Políticas y opciones de envío';
COMMENT ON COLUMN productos.payment_info IS 'Métodos de pago admitidos';
COMMENT ON COLUMN productos.custom_order_terms IS 'Términos para piezas bajo encargo o personalizadas';
COMMENT ON COLUMN productos.short_description IS 'Resumen breve para SEO y vista rápida (máx 160 caracteres)';

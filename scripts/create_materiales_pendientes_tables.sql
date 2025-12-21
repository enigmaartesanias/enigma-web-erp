-- ========================================
-- FASE 1: Crear Tablas para Materiales/Insumos
-- ========================================

-- Tabla principal de compras de materiales
CREATE TABLE IF NOT EXISTS materiales_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_compra VARCHAR(20) UNIQUE NOT NULL,
    fecha_compra DATE NOT NULL,
    proveedor_id UUID, -- Sin FK constraint por ahora
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Agregar FK solo si la tabla proveedores existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'proveedores') THEN
        ALTER TABLE materiales_compras 
        ADD CONSTRAINT fk_materiales_proveedor 
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
    END IF;
END $$;

-- Tabla de items de materiales
CREATE TABLE IF NOT EXISTS materiales_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID REFERENCES materiales_compras(id) ON DELETE CASCADE,
    nombre_material VARCHAR(200) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    unidad VARCHAR(50) DEFAULT 'Unidad',
    costo_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_materiales_compras_fecha ON materiales_compras(fecha_compra);
CREATE INDEX IF NOT EXISTS idx_materiales_compras_proveedor ON materiales_compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_materiales_items_compra ON materiales_items(compra_id);

-- ========================================
-- FASE 2: Crear Tabla de Productos Pendientes
-- ========================================

CREATE TABLE IF NOT EXISTS productos_pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID,
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad_comprada DECIMAL(10,2) NOT NULL,
    costo_compra DECIMAL(10,2) NOT NULL,
    proveedor_id UUID,
    fecha_compra DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, CREADO
    producto_creado_id UUID,
    fecha_creacion TIMESTAMP,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Agregar FK solo si las tablas existen
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'compras') THEN
        ALTER TABLE productos_pendientes 
        ADD CONSTRAINT fk_pendientes_compra 
        FOREIGN KEY (compra_id) REFERENCES compras(id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'proveedores') THEN
        ALTER TABLE productos_pendientes 
        ADD CONSTRAINT fk_pendientes_proveedor 
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos_externos') THEN
        ALTER TABLE productos_pendientes 
        ADD CONSTRAINT fk_pendientes_producto 
        FOREIGN KEY (producto_creado_id) REFERENCES productos_externos(id);
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_productos_pendientes_estado ON productos_pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_productos_pendientes_fecha ON productos_pendientes(fecha_compra);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('materiales_compras', 'materiales_items', 'productos_pendientes')
ORDER BY table_name;

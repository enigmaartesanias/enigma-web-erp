-- ========================================
-- Script de Creación Completo y Ordenado
-- ========================================
-- Este script crea las tablas en el orden correcto
-- para evitar errores de foreign keys

-- ========================================
-- 1. CREAR TABLA PROVEEDORES (si no existe)
-- ========================================
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    telefono VARCHAR(50),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 2. CREAR TABLAS DE MATERIALES
-- ========================================

-- Tabla principal de compras de materiales
CREATE TABLE IF NOT EXISTS materiales_compras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_compra VARCHAR(20) UNIQUE NOT NULL,
    fecha_compra DATE NOT NULL,
    proveedor_id UUID REFERENCES proveedores(id),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

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
-- 3. CREAR TABLA DE PRODUCTOS PENDIENTES
-- ========================================

CREATE TABLE IF NOT EXISTS productos_pendientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    compra_id UUID,
    nombre_producto VARCHAR(200) NOT NULL,
    cantidad_comprada DECIMAL(10,2) NOT NULL,
    costo_compra DECIMAL(10,2) NOT NULL,
    proveedor_id UUID REFERENCES proveedores(id),
    fecha_compra DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    producto_creado_id UUID,
    fecha_creacion TIMESTAMP,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Agregar FK a compras solo si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'compras') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_pendientes_compra'
        ) THEN
            ALTER TABLE productos_pendientes 
            ADD CONSTRAINT fk_pendientes_compra 
            FOREIGN KEY (compra_id) REFERENCES compras(id);
        END IF;
    END IF;
END $$;

-- Agregar FK a productos_externos solo si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos_externos') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_pendientes_producto'
        ) THEN
            ALTER TABLE productos_pendientes 
            ADD CONSTRAINT fk_pendientes_producto 
            FOREIGN KEY (producto_creado_id) REFERENCES productos_externos(id);
        END IF;
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_productos_pendientes_estado ON productos_pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_productos_pendientes_fecha ON productos_pendientes(fecha_compra);

-- ========================================
-- VERIFICACIÓN
-- ========================================

SELECT 
    'Tablas creadas exitosamente:' as mensaje,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
FROM information_schema.tables t
WHERE table_name IN ('proveedores', 'materiales_compras', 'materiales_items', 'productos_pendientes')
ORDER BY table_name;

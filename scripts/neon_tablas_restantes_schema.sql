-- Schema para tablas restantes en Neon DB
-- Tablas: productos, categorias, stock_tienda, carousel_items, materiales
-- Ejecutar ANTES de import_tablas_restantes.sql

-- ========================================
-- MATERIALES
-- ========================================
CREATE TABLE IF NOT EXISTS materiales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CATEGORÍAS
-- ========================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PRODUCTOS
-- ========================================
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    descripcion TEXT,
    imagen_url TEXT,
    material VARCHAR(100),
    stock INTEGER DEFAULT 0,
    precio_oferta NUMERIC(10, 2),
    precio_mayorista NUMERIC(10, 2),
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- STOCK TIENDA
-- ========================================
CREATE TABLE IF NOT EXISTS stock_tienda (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL DEFAULT 0,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CAROUSEL ITEMS
-- ========================================
CREATE TABLE IF NOT EXISTS carousel_items (
    id SERIAL PRIMARY KEY,
    imagen_url TEXT NOT NULL,
    titulo VARCHAR(255),
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado);
CREATE INDEX IF NOT EXISTS idx_stock_producto ON stock_tienda(producto_id);
CREATE INDEX IF NOT EXISTS idx_carousel_orden ON carousel_items(orden);
CREATE INDEX IF NOT EXISTS idx_categorias_activo ON categorias(activo);

-- ========================================
-- DESHABILITAR RLS
-- ========================================
ALTER TABLE materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_tienda DISABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_items DISABLE ROW LEVEL SECURITY;

-- ========================================
-- COMENTARIOS
-- ========================================
COMMENT ON TABLE productos IS 'Catálogo de productos - imágenes en Firebase Storage';
COMMENT ON TABLE categorias IS 'Categorías de productos';
COMMENT ON TABLE stock_tienda IS 'Control de stock por producto';
COMMENT ON TABLE carousel_items IS 'Items del carrusel principal';
COMMENT ON TABLE materiales IS 'Materiales disponibles para productos';

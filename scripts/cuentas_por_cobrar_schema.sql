-- Script para crear tablas del sistema de Cuentas por Cobrar
-- Sistema ERP - EnigmaArtesanías
-- Fecha: 2026-01-01

-- =====================================================
-- Tabla principal: CUENTAS POR COBRAR
-- =====================================================
CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
    id SERIAL PRIMARY KEY,
    codigo_cuenta VARCHAR(20) UNIQUE NOT NULL,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Datos del cliente
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_documento VARCHAR(20),
    
    -- Montos
    total DECIMAL(10, 2) NOT NULL,
    a_cuenta DECIMAL(10, 2) DEFAULT 0,
    saldo_deudor DECIMAL(10, 2) NOT NULL,
    
    -- Estado y fechas
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, CANCELADO
    fecha_vencimiento TIMESTAMP,
    fecha_cancelacion TIMESTAMP,
    
    -- Detalles
    detalle_productos TEXT, -- JSON con info de productos
    observaciones TEXT
);

-- =====================================================
-- Tabla de historial: PAGOS_CUENTA
-- =====================================================
CREATE TABLE IF NOT EXISTS pagos_cuenta (
    id SERIAL PRIMARY KEY,
    cuenta_id INTEGER REFERENCES cuentas_por_cobrar(id) ON DELETE CASCADE,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
    observaciones TEXT
);

-- =====================================================
-- ÍNDICES para optimización
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cuentas_estado 
    ON cuentas_por_cobrar(estado);

CREATE INDEX IF NOT EXISTS idx_cuentas_cliente 
    ON cuentas_por_cobrar(cliente_documento);

CREATE INDEX IF NOT EXISTS idx_cuentas_vencimiento 
    ON cuentas_por_cobrar(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_pagos_cuenta_id 
    ON pagos_cuenta(cuenta_id);

-- =====================================================
-- COMENTARIOS para documentación
-- =====================================================
COMMENT ON TABLE cuentas_por_cobrar IS 'Gestión de ventas a crédito con pagos parciales';
COMMENT ON TABLE pagos_cuenta IS 'Historial completo de pagos/abonos de cada cuenta';

COMMENT ON COLUMN cuentas_por_cobrar.codigo_cuenta IS 'Código único correlativo (ej: CXC-0001)';
COMMENT ON COLUMN cuentas_por_cobrar.total IS 'Monto total de la venta';
COMMENT ON COLUMN cuentas_por_cobrar.a_cuenta IS 'Monto pagado hasta el momento (acumulado)';
COMMENT ON COLUMN cuentas_por_cobrar.saldo_deudor IS 'Saldo pendiente de pago (total - a_cuenta)';
COMMENT ON COLUMN cuentas_por_cobrar.detalle_productos IS 'JSON con detalle de productos vendidos';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecutar esta consulta para verificar que las tablas fueron creadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('cuentas_por_cobrar', 'pagos_cuenta');

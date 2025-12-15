// Script para exportar datos de tablas restantes desde Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
    'https://qwvhrtdddpmaovnyarhr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw'
);

console.log('📤 Exportando tablas de Supabase...\n');

async function exportarTablas() {
    try {
        // 1. Productos
        const { data: productos, error: e1 } = await supabase.from('productos').select('*');
        if (e1) throw e1;
        console.log(`✅ Productos: ${productos.length} registros`);

        // 2. Categorías
        const { data: categorias, error: e2 } = await supabase.from('categorias').select('*');
        if (e2) throw e2;
        console.log(`✅ Categorías: ${categorias.length} registros`);

        // 3. Stock
        const { data: stock, error: e3 } = await supabase.from('stock_tienda').select('*');
        if (e3) throw e3;
        console.log(`✅ Stock: ${stock.length} registros`);

        // 4. Carousel
        const { data: carousel, error: e4 } = await supabase.from('carousel_items').select('*');
        if (e4) throw e4;
        console.log(`✅ Carousel: ${carousel.length} registros`);

        // 5. Materiales
        const { data: materiales, error: e5 } = await supabase.from('materiales').select('*');
        if (e5) throw e5;
        console.log(`✅ Materiales: ${materiales.length} registros\n`);

        // Generar SQL
        let sql = `-- Migración de tablas restantes desde Supabase a Neon DB
-- Generado: ${new Date().toISOString()}

-- Deshabilitar RLS
ALTER TABLE IF EXISTS productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock_tienda DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carousel_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materiales DISABLE ROW LEVEL SECURITY;

-- Limpiar tablas
TRUNCATE TABLE stock_tienda, carousel_items, categorias, productos, materiales RESTART IDENTITY CASCADE;

`;

        // SQL para materiales
        sql += '\n-- MATERIALES\n';
        for (const m of materiales) {
            sql += `INSERT INTO materiales (nombre, activo) VALUES ('${m.nombre.replace(/'/g, "''")}', ${m.activo});\n`;
        }

        // SQL para categorías
        sql += '\n-- CATEGORÍAS\n';
        for (const c of categorias) {
            sql += `INSERT INTO categorias (id, nombre, descripcion, imagen_url, activo, orden) 
VALUES (${c.id}, '${c.nombre.replace(/'/g, "''")}', ${c.descripcion ? `'${c.descripcion.replace(/'/g, "''")}'` : 'NULL'}, 
'${c.imagen_url}', ${c.activo}, ${c.orden || 0});\n`;
        }

        // SQL para productos
        sql += '\n-- PRODUCTOS\n';
        for (const p of productos) {
            const values = [
                p.id,
                `'${(p.nombre || '').replace(/'/g, "''")}'`,
                p.categoria_id || 'NULL',
                p.precio || 0,
                p.descripcion ? `'${p.descripcion.replace(/'/g, "''")}'` : 'NULL',
                p.imagen_url ? `'${p.imagen_url}'` : 'NULL',
                `'${p.material || ''}'`,
                p.stock !== undefined ? p.stock : 0,
                p.precio_oferta || 'NULL',
                p.precio_mayorista || 'NULL',
                p.activo !== undefined ? p.activo : true,
                p.destacado !== undefined ? p.destacado : false
            ];
            sql += `INSERT INTO productos (id, nombre, categoria_id, precio, descripcion, imagen_url, material, stock, precio_oferta, precio_mayorista, activo, destacado) 
VALUES (${values.join(', ')});\n`;
        }

        // SQL para stock
        sql += '\n-- STOCK TIENDA\n';
        for (const s of stock) {
            sql += `INSERT INTO stock_tienda (producto_id, cantidad, ultima_actualizacion) 
VALUES (${s.producto_id}, ${s.cantidad}, '${s.ultima_actualizacion}');\n`;
        }

        // SQL para carousel
        sql += '\n-- CAROUSEL ITEMS\n';
        for (const item of carousel) {
            sql += `INSERT INTO carousel_items (id, imagen_url, titulo, descripcion, orden, activo, link) 
VALUES (${item.id}, '${item.imagen_url}', ${item.titulo ? `'${item.titulo.replace(/'/g, "''")}'` : 'NULL'}, 
${item.descripcion ? `'${item.descripcion.replace(/'/g, "''")}'` : 'NULL'}, ${item.orden}, ${item.activo}, ${item.link ? `'${item.link}'` : 'NULL'});\n`;
        }

        sql += `\n-- Verificación\nSELECT 'Productos' as tabla, COUNT(*) FROM productos
UNION ALL SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL SELECT 'Stock', COUNT(*) FROM stock_tienda
UNION ALL SELECT 'Carousel', COUNT(*) FROM carousel_items
UNION ALL SELECT 'Materiales', COUNT(*) FROM materiales;\n`;

        // Guardar
        fs.writeFileSync('scripts/import_tablas_restantes.sql', sql, 'utf8');
        console.log('✅ Archivo SQL generado: scripts/import_tablas_restantes.sql\n');
        console.log('📋 Próximo paso: Ejecutar en consola SQL de Neon DB');

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

exportarTablas();

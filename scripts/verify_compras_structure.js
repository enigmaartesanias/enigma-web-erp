import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.VITE_DATABASE_URL);

async function verifyNewStructure() {
    try {
        console.log('=== Verificando Estructura de Base de Datos ===\n');

        // 1. Verificar tabla proveedores
        console.log('1. Tabla PROVEEDORES:');
        const proveedores = await sql`SELECT * FROM proveedores LIMIT 3`;
        console.log(`   ✓ ${proveedores.length} proveedores encontrados`);
        if (proveedores.length > 0) {
            console.log(`   Ejemplo: ${proveedores[0].nombre}`);
        }

        // 2. Verificar tabla compras_items
        console.log('\n2. Tabla COMPRAS_ITEMS:');
        const itemsCount = await sql`SELECT COUNT(*) as total FROM compras_items`;
        console.log(`   ✓ Tabla creada, ${itemsCount[0].total} items registrados`);

        // 3. Verificar columnas nuevas en compras
        console.log('\n3. Nuevas columnas en COMPRAS:');
        const comprasColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'compras' 
            AND column_name IN ('tipo_item', 'proveedor_id')
        `;
        comprasColumns.forEach(col => {
            console.log(`   ✓ ${col.column_name}: ${col.data_type}`);
        });

        // 4. Verificar relaciones
        console.log('\n4. Verificando Foreign Keys:');
        const fks = await sql`
            SELECT 
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name IN ('compras', 'compras_items')
        `;
        fks.forEach(fk => {
            console.log(`   ✓ ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });

        console.log('\n✅ Estructura verificada correctamente\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyNewStructure();

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function addEnviadoInventarioColumn() {
    try {
        console.log('Agregando columna enviado_a_inventario a tabla produccion...');

        await sql`
            ALTER TABLE produccion 
            ADD COLUMN IF NOT EXISTS enviado_a_inventario BOOLEAN DEFAULT FALSE
        `;

        console.log('✅ Columna agregada exitosamente');

        // Verificar la estructura de la tabla
        const columns = await sql`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'produccion'
            ORDER BY ordinal_position
        `;

        console.log('\n📋 Estructura actual de la tabla produccion:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default || 'none'})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addEnviadoInventarioColumn();

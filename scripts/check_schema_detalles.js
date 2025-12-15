
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function checkSchema() {
    console.log('🔍 Verificando esquema de la tabla "detalles_pedido"...');
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'detalles_pedido';
        `;

        console.log('Columnas encontradas:');
        columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

        const hasMetal = columns.some(c => c.column_name === 'metal');
        const hasTipoProducto = columns.some(c => c.column_name === 'tipo_producto');

        if (hasMetal) console.log('✅ Columna "metal" existe en detalles_pedido.');
        else console.log('❌ Columna "metal" NO existe en detalles_pedido.');

        if (hasTipoProducto) console.log('✅ Columna "tipo_producto" existe en detalles_pedido.');
        else console.log('❌ Columna "tipo_producto" NO existe en detalles_pedido.');

    } catch (error) {
        console.error('Error verificando esquema:', error);
    }
}

checkSchema();

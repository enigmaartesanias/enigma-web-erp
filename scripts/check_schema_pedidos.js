import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ VITE_DATABASE_URL no está configurada');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkSchema() {
    console.log('🔍 Verificando esquema de la tabla "pedidos"...');
    try {
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos';
    `;

        console.log('Columnas encontradas:');
        columns.forEach(col => {
            console.log(`- ${col.column_name} (${col.data_type})`);
        });

        const hasMetal = columns.some(c => c.column_name === 'metal');
        const hasTipoProducto = columns.some(c => c.column_name === 'tipo_producto');

        if (hasMetal) console.log('✅ Columna "metal" existe.');
        else console.log('❌ Columna "metal" NO existe.');

        if (hasTipoProducto) console.log('✅ Columna "tipo_producto" existe.');
        else console.log('❌ Columna "tipo_producto" NO existe.');

    } catch (error) {
        console.error('Error al verificar esquema:', error);
    }
}

checkSchema();

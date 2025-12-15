
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function migrate() {
    console.log('🚀 Iniciando migración de tabla detalles_pedido...');
    try {
        // 1. Agregar columnas
        await sql`
            ALTER TABLE detalles_pedido 
            ADD COLUMN IF NOT EXISTS metal VARCHAR(50),
            ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(100);
        `;
        console.log('✅ Columnas metal y tipo_producto agregadas (si no existían).');

        // 2. Verificar
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'detalles_pedido';
        `;

        const hasMetal = columns.some(c => c.column_name === 'metal');
        const hasTipo = columns.some(c => c.column_name === 'tipo_producto');

        if (hasMetal && hasTipo) {
            console.log('✅ Verificación exitosa: Ambas columnas existen.');
        } else {
            console.error('❌ Error: Al menos una columna no se creó.', { hasMetal, hasTipo });
        }

    } catch (error) {
        console.error('❌ Error fatal en migración:', error);
    }
}

migrate();

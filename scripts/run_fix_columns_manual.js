
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config({ path: 'c:\\webagosto2025\\.env' });

const sql = neon(process.env.VITE_DATABASE_URL);

async function runMigration() {
    console.log('Ejecutando alter table manual...');
    try {
        await sql`ALTER TABLE detalles_pedido ADD COLUMN IF NOT EXISTS metal VARCHAR(100)`;
        console.log('✅ Columna metal verificada.');

        await sql`ALTER TABLE detalles_pedido ADD COLUMN IF NOT EXISTS tipo_producto VARCHAR(100)`;
        console.log('✅ Columna tipo_producto verificada.');

    } catch (error) {
        console.error('❌ Error al ejecutar SQL:', error);
    }
}

runMigration();

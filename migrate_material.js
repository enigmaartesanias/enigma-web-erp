
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function run() {
    try {
        console.log('--- Migración de Base de Datos Enigma ---');
        console.log('Añadiendo columna "material" a productos_externos...');
        await sql`ALTER TABLE productos_externos ADD COLUMN IF NOT EXISTS material VARCHAR(255)`;
        console.log('✅ Éxito: Columna material añadida o ya existía.');
    } catch (err) {
        console.error('❌ Error en la migración:', err);
    } finally {
        process.exit();
    }
}

run();

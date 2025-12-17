import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sql = neon(process.env.VITE_DATABASE_URL);

async function runSchema() {
    try {
        console.log('📦 Inicializando tabla productos_externos...');

        const schemaPath = path.resolve(__dirname, 'schema_productos_externos.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await sql(schemaSql);

        console.log('✅ Tabla productos_externos creada correctamente.');

    } catch (error) {
        console.error('❌ Error creando tabla:', error);
    }
}

runSchema();

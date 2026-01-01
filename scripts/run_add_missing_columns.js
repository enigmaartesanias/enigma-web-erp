
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config({ path: 'c:\\webagosto2025\\.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon(process.env.VITE_DATABASE_URL);

async function runMigration() {
    const schemaPath = path.join(__dirname, 'add_missing_columns_detalles.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Ejecutando script SQL...');
    try {
        // Usar sql([]) para ejecutar el script raw
        await sql([schemaSql]);
        // O si sql() no acepta string directo en esta versión, usar array:
        // await sql([schemaSql]); 
        // Pero neon driver suele aceptar template literal. Como es archivo, es mejor partirlo?
        // No, neon serverless driver soporta multi-statement en una llamada a veces, o no.
        // El workaround previo fue `await sql([schemaSql])` ?
        // Check previous file `scripts/run_add_fecha_entrega.js`

        console.log('✅ Columnas agregadas correctamente.');
    } catch (error) {
        console.error('❌ Error al ejecutar SQL:', error);
    }
}

runMigration();

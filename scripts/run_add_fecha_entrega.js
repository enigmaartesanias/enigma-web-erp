import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sql = neon(process.env.VITE_DATABASE_URL);

async function runSchema() {
    console.log('Running add_fecha_entrega_pedidos.sql...');
    try {
        const schemaPath = path.join(__dirname, 'add_fecha_entrega_pedidos.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Trick to pass raw string to tagged template function
        await sql([schemaSql]);

        console.log('Column fecha_entrega added successfully.');
    } catch (error) {
        console.error('Error adding column:', error);
        process.exit(1);
    }
}

runSchema();

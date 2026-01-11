import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ VITE_DATABASE_URL no está definida en .env');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
    try {
        console.log('🚀 Iniciando migración de fechas de producción...');

        const sqlPath = path.join(__dirname, 'add_fechas_produccion.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Separar por punto y coma para ejecutar individualmente
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`📝 Encontradas ${statements.length} sentencias SQL.`);

        for (const statement of statements) {
            console.log(`⏳ Ejecutando: ${statement.substring(0, 50)}...`);
            await sql(statement);
        }

        console.log('✅ Migración completada exitosamente.');
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

runMigration();

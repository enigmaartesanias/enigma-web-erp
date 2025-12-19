// Script para ejecutar la migración de pedidos
// Uso: node scripts/ejecutar_migracion_pedidos.js

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer el archivo .env para obtener la URL de la base de datos
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ VITE_DATABASE_URL no está configurada en .env');
    process.exit(1);
}

async function ejecutarMigracion() {
    const sql = neon(DATABASE_URL);

    console.log('🚀 Iniciando migración de pedidos...\n');

    try {
        // Leer el archivo SQL
        const sqlFilePath = join(__dirname, 'migrate_pedidos_nuevos_estados.sql');
        const sqlContent = readFileSync(sqlFilePath, 'utf-8');

        // Dividir en statements individuales (esto es una simplificación)
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📋 Ejecutando ${statements.length} comandos SQL...\n`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.includes('COMMENT ON') ||
                statement.includes('ALTER TABLE') ||
                statement.includes('CREATE INDEX') ||
                statement.includes('UPDATE pedidos')) {
                console.log(`⏳ Ejecutando comando ${i + 1}/${statements.length}...`);
                try {
                    await sql(statement);
                    console.log(`✅ Comando ${i + 1} ejecutado exitosamente\n`);
                } catch (err) {
                    console.log(`⚠️  Advertencia en comando ${i + 1}: ${err.message}\n`);
                    // Continuar con los siguientes comandos
                }
            }
        }

        console.log('✅ MIGRACIÓN COMPLETADA\n');
        console.log('📊 Verificando resultados...\n');

        // Verificar migración
        const resumen = await sql`
      SELECT 
        estado_pedido,
        estado_produccion,
        COUNT(*) as total
      FROM pedidos
      GROUP BY estado_pedido, estado_produccion
      ORDER BY estado_pedido, estado_produccion
    `;

        console.log('📈 Resumen de Estados:');
        console.table(resumen);

        // Totales
        const totales = await sql`
      SELECT COUNT(*) as total FROM pedidos
    `;
        console.log(`\n📦 Total de pedidos: ${totales[0].total}`);

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

ejecutarMigracion();

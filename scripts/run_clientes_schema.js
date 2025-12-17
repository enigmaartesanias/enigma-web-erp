const pg = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.VITE_NEON_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

async function runSchema() {
    const client = await pool.connect();

    try {
        console.log('📋 Ejecutando schema de clientes...');

        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'clientes_schema.sql'),
            'utf-8'
        );

        await client.query(schemaSQL);

        console.log('✅ Schema de clientes ejecutado correctamente');

        // Verificar que la tabla existe
        const checkTable = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'clientes'
        `);

        if (checkTable.rows.length > 0) {
            console.log('✅ Tabla clientes creada');
        }

        // Verificar columna cliente_id en ventas
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ventas' 
            AND column_name = 'cliente_id'
        `);

        if (checkColumn.rows.length > 0) {
            console.log('✅ Columna cliente_id agregada a ventas');
        }

    } catch (error) {
        console.error('❌ Error ejecutando schema:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runSchema();

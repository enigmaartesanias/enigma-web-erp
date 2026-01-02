
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Intentar cargar .env localmente si no está cargado
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Asumiendo ejecutado desde raiz o scripts/
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    console.log('Loading .env from:', envPath);
    // Parse simple .env manually/dotenv logic if dotenv/config didn't catch it (vite uses .env, node might not auto-load without config)
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key]) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const url = process.env.VITE_DATABASE_URL;

console.log('--- DB DIAGNOSTIC ---');
if (!url) {
    console.error('❌ CRITICAL: VITE_DATABASE_URL is not defined in process.env');
    process.exit(1);
}

console.log('URL Present:', url ? 'YES' : 'NO');
console.log('URL Start:', url.substring(0, 15) + '...');

try {
    const sql = neon(url);
    console.log('Connecting to Neon...');
    const result = await sql`SELECT count(*) FROM pedidos`;
    const count = result[0].count;
    console.log('✅ Connection Successful');
    console.log('📊 PEDIDOS COUNT:', count);

    if (parseInt(count) > 0) {
        console.log('Fetching sample orders...');
        const sample = await sql`SELECT id_pedido, nombre_cliente, estado_pedido, estado_produccion, fecha_pedido FROM pedidos ORDER BY fecha_pedido DESC LIMIT 5`;
        console.table(sample);

        // Check Carla specifically
        const carla = await sql`SELECT id_pedido, nombre_cliente, estado_pedido, estado_produccion FROM pedidos WHERE nombre_cliente ILIKE '%Carla%'`;
        if (carla.length > 0) {
            console.log('🔍 FOUND CARLA:', carla);
        } else {
            console.log('❌ CARLA NOT FOUND via SQL ILIKE search');
        }

    } else {
        console.log('⚠️ TABLE IS EMPTY. This explains why the frontend shows 0.');
    }

} catch (e) {
    console.error('❌ CONNECTION ERROR:', e);
}


import { neon } from '@neondatabase/serverless';

const url = "postgresql://neondb_owner:npg_PIU3bHc7oXTt@ep-bitter-pond-ahd82tev-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function run() {
    try {
        console.log('Migración Directa...');
        await sql`ALTER TABLE productos_externos ADD COLUMN IF NOT EXISTS material VARCHAR(255)`;
        console.log('Confirmando...');
        const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'productos_externos' AND column_name = 'material'`;
        if (res.length > 0) console.log('ÉXITO: Columna creada.');
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        process.exit();
    }
}

run();

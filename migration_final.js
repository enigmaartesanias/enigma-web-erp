
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_DATABASE_URL;
const sql = neon(url);

async function run() {
    try {
        console.log('--- DB UPDATE ---');
        // Usar TAGGED TEMPLATE LITERAL (obligatorio para neon)
        await sql`ALTER TABLE productos_externos ADD COLUMN IF NOT EXISTS material VARCHAR(255)`;
        console.log('✅ Column "material" added successfully.');
        
        const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'productos_externos' AND column_name = 'material'`;
        if (res.length > 0) {
            console.log('✅ Verificado: La columna existe.');
        } else {
            console.log('❌ Error: La columna NO se creó.');
        }
    } catch (err) {
        console.error('❌ CRITICAL ERROR:', err.message);
    } finally {
        process.exit();
    }
}

run();

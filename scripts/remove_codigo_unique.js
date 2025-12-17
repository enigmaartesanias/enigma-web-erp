import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sql = neon(process.env.VITE_DATABASE_URL);

async function removeUniqueConstraint() {
    try {
        console.log('🔧 Quitando restricción UNIQUE de codigo_usuario...');

        // Ejecutar directamente el SQL
        await sql`ALTER TABLE productos_externos DROP CONSTRAINT IF EXISTS productos_externos_codigo_usuario_key`;

        console.log('✅ Restricción UNIQUE eliminada correctamente.');
        console.log('📝 Ahora puedes usar el mismo código para múltiples productos.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

removeUniqueConstraint();

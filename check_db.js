
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function checkColumns() {
    try {
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'productos_externos'
        `;
        console.log('Columnas en productos_externos:', columns.map(c => c.column_name).join(', '));
    } catch (err) {
        console.error('Error checking columns:', err);
    } finally {
        process.exit();
    }
}

checkColumns();

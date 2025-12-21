import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.VITE_DATABASE_URL);

async function checkSchema() {
    try {
        const columns = await sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'compras' 
            ORDER BY ordinal_position
        `;

        console.log(JSON.stringify(columns, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSchema();

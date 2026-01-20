import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.VITE_DATABASE_URL);

async function checkColumns() {
    const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'productos_externos'
  `;
    columns.forEach(c => console.log(c.column_name));
}

checkColumns().catch(console.error);

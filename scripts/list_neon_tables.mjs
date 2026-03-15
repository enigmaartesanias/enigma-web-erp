import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function run() {
    try {
        console.log("--- TABLAS EN LA BASE DE DATOS NEON ---");
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `;
        
        tables.forEach(t => console.log(`- ${t.table_name}`));
        console.log("\nProceso terminado.");
    } catch (e) {
        console.error('Error:', e.message);
    }
}

run();

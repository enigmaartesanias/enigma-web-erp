
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const url = process.env.VITE_DATABASE_URL;
const sql = neon(url);

async function inspect() {
    try {
        console.log('--- Inspecting Tables ---');

        // List tables
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;
        console.log('Tables:', tables.map(t => t.table_name).join(', '));

        console.log('\n--- Columns of produccion_taller ---');
        console.log('\n--- Columns of produccion_taller ---');
        const prodColumns = await sql`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'produccion_taller'
            ORDER BY column_name;
        `;
        prodColumns.forEach(c => console.log(`${c.column_name} (${c.data_type})`));

        console.log('\n--- Checking for users and roles ---');
        const userCount = await sql`SELECT count(*) FROM usuarios`;
        console.log('Total users:', userCount[0].count);

        if (parseInt(userCount[0].count) > 0) {
            const roles = await sql`SELECT DISTINCT rol FROM usuarios`;
            console.log('Roles found:', roles.map(r => r.rol || 'NULL').join(', '));

            const adminUser = await sql`SELECT email, rol FROM usuarios WHERE rol ILIKE '%admin%' LIMIT 1`;
            if (adminUser.length > 0) {
                console.log('Found admin-like user:', adminUser[0].email, 'with role:', adminUser[0].rol);
            }
        } else {
            console.log('No users found in usuarios table.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

inspect();

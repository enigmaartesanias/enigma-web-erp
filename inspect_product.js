import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

async function inspect() {
  try {
    console.log('--- Inspecting ANIA0706 in Inventory ---');
    const res = await sql`SELECT * FROM productos_externos WHERE codigo_usuario ILIKE 'ANIA0706'`;
    console.log(JSON.stringify(res, null, 2));
    
    console.log('--- Inspecting PR-0062 in Production ---');
    const prod = await sql`SELECT * FROM produccion_taller WHERE id_produccion = 62 OR codigo_correlativo = 'PR-0062'`;
    console.log(JSON.stringify(prod, null, 2));
  } catch (e) {
    console.error(e);
  }
}
inspect();

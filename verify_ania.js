import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

async function check() {
  try {
    const res = await sql`SELECT id, codigo_usuario, codigo_produccion_origen FROM productos_externos WHERE codigo_usuario = 'ANIA0706'`;
    console.log('Results for ANIA0706:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
check();

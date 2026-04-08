import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

async function fix() {
  try {
    const res = await sql`
      UPDATE productos_externos 
      SET codigo_produccion_origen = 'PR-0062', 
          produccion_id = 62 
      WHERE codigo_usuario = 'ANIA0706'
    `;
    console.log('✅ Registro ANIA0706 corregido con éxito');
  } catch (e) {
    console.error('❌ Error al corregir:', e);
  }
}
fix();

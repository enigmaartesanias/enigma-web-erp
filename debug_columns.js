import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

async function inspect() {
  try {
    const res = await sql`SELECT id, codigo_usuario, codigo_produccion_origen, stock_actual, fecha_registro FROM productos_externos WHERE codigo_usuario ILIKE 'ANIA0706'`;
    console.log('Inventory Records for ANIA0706:');
    console.table(res);
    
    // Check if there are any hidden characters
    if (res.length > 0) {
      console.log('Keys in first record:', Object.keys(res[0]));
      console.log('Value of codigo_produccion_origen:', JSON.stringify(res[0].codigo_produccion_origen));
    }
  } catch (e) {
    console.error(e);
  }
}
inspect();

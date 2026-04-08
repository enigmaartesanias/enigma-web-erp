import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL no está configurada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function updateDB() {
  try {
    console.log('🔄 Iniciando actualización de base de datos...');
    
    await sql`ALTER TABLE produccion_taller ADD COLUMN IF NOT EXISTS codigo_correlativo VARCHAR(20)`;
    console.log('✅ Columna codigo_correlativo añadida a produccion_taller');
    
    await sql`UPDATE produccion_taller SET codigo_correlativo = 'PR-' || LPAD(id_produccion::text, 4, '0') WHERE codigo_correlativo IS NULL`;
    console.log('✅ Correlativos existentes actualizados');
    
    await sql`ALTER TABLE productos_externos ADD COLUMN IF NOT EXISTS codigo_produccion_origen VARCHAR(20)`;
    console.log('✅ Columna codigo_produccion_origen añadida a productos_externos');
    
    await sql`
      UPDATE productos_externos pe
      SET codigo_produccion_origen = pt.codigo_correlativo
      FROM produccion_taller pt
      WHERE pe.produccion_id = pt.id_produccion
      AND pe.codigo_produccion_origen IS NULL
    `;
    console.log('✅ Vínculos de correlativos actualizados en inventario');
    
    console.log('🚀 Actualización completada con éxito');
  } catch (error) {
    console.error('❌ Error actualizando BD:', error);
  }
}

updateDB();

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
    console.log('🔄 Iniciando actualización de base de datos para inventario...');
    
    // Add column tipo_inventario
    await sql`ALTER TABLE productos_externos ADD COLUMN IF NOT EXISTS tipo_inventario VARCHAR(20) DEFAULT 'Único'`;
    console.log('✅ Columna tipo_inventario añadida a productos_externos');
    
    // Set existing records to 'Único' if they are null
    await sql`UPDATE productos_externos SET tipo_inventario = 'Único' WHERE tipo_inventario IS NULL`;
    console.log('✅ Registros históricos actualizados a Único');
    
    console.log('🚀 Actualización completada con éxito');
  } catch (error) {
    console.error('❌ Error actualizando BD:', error);
  }
}

updateDB();

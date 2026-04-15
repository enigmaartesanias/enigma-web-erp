import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

async function addLoteColumn() {
  try {
    const DATABASE_URL = process.env.VITE_DATABASE_URL;
    if (!DATABASE_URL) throw new Error('VITE_DATABASE_URL no está definida');
    
    const sql = neon(DATABASE_URL);
    
    console.log('Iniciando actualización de la tabla productos_externos...');
    
    const query = fs.readFileSync('scripts/add_lote_productos_externos.sql', 'utf-8');
    
    await sql(query);
    
    console.log('Migración completada exitosamente. La columna lote ha sido añadida.');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

addLoteColumn();

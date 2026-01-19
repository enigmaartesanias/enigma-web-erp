
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.VITE_DATABASE_URL);

async function fixColumns() {
    try {
        console.log('🔧 Verificando y creando columnas faltantes...');

        // 1. Agregar columnas si no existen
        await sql`
      ALTER TABLE produccion_taller 
      ADD COLUMN IF NOT EXISTS fecha_inicio_produccion DATE,
      ADD COLUMN IF NOT EXISTS fecha_fin_produccion DATE;
    `;
        console.log('✅ Columnas fecha_inicio_produccion y fecha_fin_produccion verificadas.');

        // 2. Migrar datos de inicio (si es NULL)
        await sql`
      UPDATE produccion_taller 
      SET fecha_inicio_produccion = fecha_produccion 
      WHERE fecha_inicio_produccion IS NULL;
    `;
        console.log('✅ Fechas de inicio migradas.');

        // 3. Migrar datos de fin (si es terminado y es NULL)
        await sql`
      UPDATE produccion_taller 
      SET fecha_fin_produccion = fecha_produccion 
      WHERE estado_produccion = 'terminado' AND fecha_fin_produccion IS NULL;
    `;
        console.log('✅ Fechas de fin migradas.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixColumns();

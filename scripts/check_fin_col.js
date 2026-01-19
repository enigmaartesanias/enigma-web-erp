
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.VITE_DATABASE_URL);

async function checkColumn() {
    try {
        console.log('Verificando columnas en produccion_taller...');
        // Query system catalog to check for column
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'produccion_taller' AND column_name = 'fecha_fin_produccion';
    `;

        if (columns.length > 0) {
            console.log('✅ La columna fecha_fin_produccion EXISTE.');
            console.log('Tipo:', columns[0].data_type);
        } else {
            console.error('❌ La columna fecha_fin_produccion NO EXISTE.');
        }

        // Check data
        console.log('\nVerificando datos en registros terminados:');
        const records = await sql`
      SELECT id_produccion, nombre_producto, estado_produccion, fecha_produccion, fecha_fin_produccion
      FROM produccion_taller
      WHERE estado_produccion = 'terminado'
      LIMIT 5;
    `;
        console.table(records);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkColumn();

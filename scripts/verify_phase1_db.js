import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qwvhrtdddpmaovnyarhr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw';

const supabase = createClient(supabaseUrl, supabaseKey);

const requiredColumns = [
  'is_ready_to_ship',
  'stock_quantity',
  'price_offer',
  'weight_grams',
  'dimensions',
  'material',
  'process_technique',
  'shipping_info',
  'payment_info',
  'custom_order_terms',
  'short_description'
];

async function verify() {
  console.log('🔍 [FASE 1] Verificando estructura en Supabase para tabla "productos"...\n');

  let allExist = true;
  const missing = [];
  const existing = [];

  for (const col of requiredColumns) {
    const { data, error } = await supabase.from('productos').select(col).limit(1);
    if (error) {
      allExist = false;
      missing.push({ col, error: error.message });
      console.log(`❌ Campo faltante: ${col} -> ${error.message}`);
    } else {
      existing.push(col);
      console.log(`✅ Campo verificado: ${col}`);
    }
  }

  console.log('\n────────────────────────────────────────────────────────');
  if (allExist) {
    console.log('🎉 ¡ÉXITO! Todos los campos de la FASE 1 existen y son accesibles en Supabase.');
    
    // Probar lectura de una muestra
    const { data: sample, error: sampleErr } = await supabase
      .from('productos')
      .select(`id, titulo, ${requiredColumns.join(', ')}`)
      .limit(1);

    if (!sampleErr && sample && sample.length > 0) {
      console.log('\n📄 Registro de muestra obtenido:');
      console.log(JSON.stringify(sample[0], null, 2));
    }
    process.exit(0);
  } else {
    console.log(`⚠️ Aún faltan ${missing.length} de ${requiredColumns.length} columnas en la tabla "productos".`);
    console.log('👉 Ejecuta el script SQL en Supabase SQL Editor:');
    console.log(`   https://supabase.com/dashboard/project/qwvhrtdddpmaovnyarhr/sql/new`);
    process.exit(1);
  }
}

verify().catch((err) => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwvhrtdddpmaovnyarhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Verificando columnas en tabla productos...');

  // Intentar leer las nuevas columnas
  const { data, error } = await supabase
    .from('productos')
    .select('id, precio, precio_internacional_base, precio_local')
    .limit(1);

  if (!error) {
    console.log('✅ Las columnas precio_internacional_base y precio_local YA EXISTEN.');
    console.log('Dato de muestra:', JSON.stringify(data));
  } else {
    console.log('❌ Las columnas no existen aún. Error:', error.message);
    console.log('');
    console.log('👉 Ejecuta este SQL en el editor de Supabase:');
    console.log('   https://app.supabase.com/project/qwvhrtdddpmaovnyarhr/sql/new');
    console.log('');
    console.log(`ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS precio_internacional_base NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS precio_local NUMERIC(10,2) DEFAULT NULL;`);
  }
}

main().catch(console.error);

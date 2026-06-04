import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwvhrtdddpmaovnyarhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addCategories() {
  const { data, error } = await supabase
    .from('categorias')
    .upsert([
      { nombre: 'VINCHA_TIARA' },
      { nombre: 'TOBILLERA' }
    ], { onConflict: 'nombre' });
  if (error) console.error('Error insertando categorias:', error);
  else console.log('Categorías insertadas/actualizadas exitosamente.');
}

addCategories();

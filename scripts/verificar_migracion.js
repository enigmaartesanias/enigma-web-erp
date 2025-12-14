// Script de última verificación - mostrar error específico
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

console.log('🔍 Verificación detallada...\n');

try {
    // Ver si las tablas existen
    const tablas = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('pedidos', 'detalles_pedido', 'pagos')
  `;

    console.log('📋 Tablas encontradas:');
    tablas.forEach(t => console.log(`   - ${t.table_name}`));

    if (tablas.length === 0) {
        console.log('\n❌ ERROR: Las tablas NO EXISTEN en Neon DB');
        console.log('➡️  Debes ejecutar primero el script schema SQL en Neon');
        process.exit(1);
    }

    // Contar registros
    const counts = await sql`
    SELECT 
      (SELECT COUNT(*) FROM pedidos) as pedidos,
      (SELECT COUNT(*) FROM detalles_pedido) as detalles,
      (SELECT COUNT(*) FROM pagos) as pagos
  `;

    console.log(`\n📊 Registros:`);
    console.log(`   - Pedidos: ${counts[0].pedidos}`);
    console.log(`   - Detalles: ${counts[0].detalles}`);
    console.log(`   - Pagos: ${counts[0].pagos}`);

    if (counts[0].pedidos > 0) {
        console.log('\n✅ ¡Migración EXITOSA!');
    } else {
        console.log('\n⚠️  Las tablas existen pero están VAC Í AS');
    }

} catch (err) {
    console.error('\n❌ Error de conexión:', err.message);
}

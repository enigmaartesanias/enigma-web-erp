// Script para deshabilitar RLS y migrar datos
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);
const supabase = createClient(
    'https://qwvhrtdddpmaovnyarhr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw'
);

console.log('═══════════════════════════════════════════');
console.log('  SOLUCIÓN: Deshabilitar RLS y Migrar');
console.log('═══════════════════════════════════════════\n');

try {
    // Paso 1: Deshabilitar RLS
    console.log('1️⃣ Deshabilitando RLS en todas las tablas...');

    await sql`ALTER TABLE IF EXISTS pedidos DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE IF EXISTS detalles_pedido DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE IF EXISTS pagos DISABLE ROW LEVEL SECURITY`;

    console.log('   ✅ RLS deshabilitado\n');

    // Paso 2: Limpiar tablas (por si acaso hay datos corruptos)
    console.log('2️⃣ Limpiando tablas...');
    await sql`TRUNCATE TABLE pagos, detalles_pedido, pedidos RESTART IDENTITY CASCADE`;
    console.log('   ✅ Tablas limpias\n');

    // Paso 3: Exportar de Supabase
    console.log('3️⃣ Exportando de Supabase...');
    const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select(`*, detalles_pedido (*), pagos (*)`)
        .order('fecha_pedido', { ascending: true });

    if (error) throw error;
    console.log(`   ✅ ${pedidos.length} pedidos exportados\n`);

    // Paso 4: Importar a Neon
    console.log('4️⃣ Importando a Neon DB...');

    let migrados = 0;
    for (const p of pedidos) {
        const [nuevo] = await sql`
      INSERT INTO pedidos (
        nombre_cliente, telefono, dni_ruc, direccion_entrega,
        forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
        envio_cobrado_al_cliente, envio_referencia,
        precio_total_sin_igv, precio_total, monto_a_cuenta,
        monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
        fecha_pedido
      ) VALUES (
        ${p.nombre_cliente}, ${p.telefono || ''}, ${p.dni_ruc || ''},
        ${p.direccion_entrega || ''}, ${p.forma_pago || 'Efectivo'},
        ${p.comprobante_pago || ''}, ${p.requiere_envio || false},
        ${p.modalidad_envio || 'Fijo'}, ${p.envio_cobrado_al_cliente || 0},
        ${p.envio_referencia || 0}, ${p.precio_total_sin_igv || 0},
        ${p.precio_total || 0}, ${p.monto_a_cuenta || 0},
        ${p.monto_igv || 0}, ${p.monto_saldo || 0},
        ${p.entregado || false}, ${p.cancelado || false},
        ${p.incluye_igv || false}, ${p.fecha_pedido}
      ) RETURNING id_pedido
    `;

        // Detalles
        if (p.detalles_pedido?.length > 0) {
            for (const d of p.detalles_pedido) {
                await sql`
          INSERT INTO detalles_pedido (id_pedido, nombre_producto, cantidad, precio_unitario)
          VALUES (${nuevo.id_pedido}, ${d.nombre_producto}, ${d.cantidad}, ${d.precio_unitario})
        `;
            }
        }

        // Pagos
        if (p.pagos?.length > 0) {
            for (const pago of p.pagos) {
                await sql`
          INSERT INTO pagos (id_pedido, monto, fecha_pago, metodo_pago, referencia)
          VALUES (${nuevo.id_pedido}, ${pago.monto}, ${pago.fecha_pago}, ${pago.metodo_pago || 'Efectivo'}, ${pago.referencia || ''})
        `;
            }
        }

        migrados++;
        console.log(`   ✓ Pedido #${p.id_pedido} → #${nuevo.id_pedido} (${p.nombre_cliente})`);
    }

    console.log(`\n✅ ¡Migración exitosa! ${migrados} pedidos migrados\n`);

    // Verificación final
    const [count] = await sql`SELECT COUNT(*) FROM pedidos`;
    console.log(`🔍 Verificación final: ${count.count} pedidos en Neon DB`);

} catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err);
}

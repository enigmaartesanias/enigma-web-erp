// Script de migración de pedidos desde Supabase a Neon DB
// Proyecto usa "type": "module", así que usamos import/export

import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Supabase (origen)
const supabaseUrl = 'https://qwvhrtdddpmaovnyarhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmhydGRkZHBtYW92bnlhcmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyOTU4MDUsImV4cCI6MjA2Nzg3MTgwNX0.BR9fF63sNEuoLmjQDfTj7xCVXZl9CnwOxvU-Net33Nw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de Neon DB (destino)
const neonConnectionString = process.env.VITE_DATABASE_URL;

if (!neonConnectionString) {
  console.error('❌ Error: VITE_DATABASE_URL no está configurada en .env');
  process.exit(1);
}

const sql = neon(neonConnectionString);

async function migratePedidos() {
  console.log('🚀 Iniciando migración de pedidos...\n');

  try {
    // 1. Exportar datos de Supabase
    console.log('📤 Exportando datos de Supabase...');

    const { data: pedidos, error: errorPedidos } = await supabase
      .from('pedidos')
      .select(`
        *,
        detalles_pedido (*),
        pagos (*)
      `)
      .order('fecha_pedido', { ascending: true });

    if (errorPedidos) throw errorPedidos;

    console.log(`✅ ${pedidos.length} pedidos exportados de Supabase\n`);

    if (pedidos.length === 0) {
      console.log('⚠️ No hay pedidos para migrar.');
      return;
    }

    // 2. Importar a Neon DB
    console.log('📥 Importando datos a Neon DB...');

    let pedidosMigrados = 0;
    let detallesMigrados = 0;
    let pagosMigrados = 0;

    for (const pedido of pedidos) {
      try {
        // Insertar pedido principal
        const pedidoInsert = await sql`
          INSERT INTO pedidos (
            nombre_cliente, telefono, dni_ruc, direccion_entrega,
            forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
            envio_cobrado_al_cliente, envio_referencia,
            precio_total_sin_igv, precio_total, monto_a_cuenta,
            monto_igv, monto_saldo, entregado, cancelado, incluye_igv,
            fecha_pedido
          ) VALUES (
            ${pedido.nombre_cliente}, ${pedido.telefono || ''}, ${pedido.dni_ruc || ''},
            ${pedido.direccion_entrega || ''}, ${pedido.forma_pago || 'Efectivo'},
            ${pedido.comprobante_pago || ''}, ${pedido.requiere_envio || false},
            ${pedido.modalidad_envio || 'Fijo'}, ${pedido.envio_cobrado_al_cliente || 0},
            ${pedido.envio_referencia || 0}, ${pedido.precio_total_sin_igv || 0},
            ${pedido.precio_total || 0}, ${pedido.monto_a_cuenta || 0},
            ${pedido.monto_igv || 0}, ${pedido.monto_saldo || 0},
            ${pedido.entregado || false}, ${pedido.cancelado || false},
            ${pedido.incluye_igv || false}, ${pedido.fecha_pedido || new Date().toISOString()}
          )
          RETURNING id_pedido
        `;

        const newPedidoId = pedidoInsert[0].id_pedido;
        pedidosMigrados++;

        // Insertar detalles de pedido
        if (pedido.detalles_pedido && pedido.detalles_pedido.length > 0) {
          for (const detalle of pedido.detalles_pedido) {
            await sql`
              INSERT INTO detalles_pedido (
                id_pedido, nombre_producto, cantidad, precio_unitario
              ) VALUES (
                ${newPedidoId}, ${detalle.nombre_producto || ''},
                ${detalle.cantidad || 0}, ${detalle.precio_unitario || 0}
              )
            `;
            detallesMigrados++;
          }
        }

        // Insertar pagos
        if (pedido.pagos && pedido.pagos.length > 0) {
          for (const pago of pedido.pagos) {
            await sql`
              INSERT INTO pagos (
                id_pedido, monto, fecha_pago, metodo_pago, referencia
              ) VALUES (
                ${newPedidoId}, ${pago.monto || 0}, ${pago.fecha_pago || new Date().toISOString().split('T')[0]},
                ${pago.metodo_pago || 'Efectivo'}, ${pago.referencia || ''}
              )
            `;
            pagosMigrados++;
          }
        }

        console.log(`  ✓ Pedido #${pedido.id_pedido} → #${newPedidoId} (${pedido.nombre_cliente})`);
      } catch (err) {
        console.error(`  ❌ Error migrando pedido #${pedido.id_pedido}:`, err.message);
      }
    }

    console.log('\n✅ Migración completada exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Pedidos migrados: ${pedidosMigrados}`);
    console.log(`   - Detalles migrados: ${detallesMigrados}`);
    console.log(`   - Pagos migrados: ${pagosMigrados}\n`);

    // 3. Verificación
    console.log('🔍 Verificando datos en Neon DB...');
    const verificacion = await sql`
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(precio_total), 0) as total_ventas
      FROM pedidos
    `;

    console.log(`   - Total pedidos en Neon: ${verificacion[0].total_pedidos}`);
    console.log(`   - Total en ventas: S/ ${parseFloat(verificacion[0].total_ventas).toFixed(2)}\n`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Ejecutar migración
console.log('═══════════════════════════════════════════════════════');
console.log('  Migración de Pedidos: Supabase → Neon DB');
console.log('═══════════════════════════════════════════════════════\n');

migratePedidos()
  .then(() => {
    console.log('\n🎉 ¡Migración completada con éxito!');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error.message);
    console.error('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  });

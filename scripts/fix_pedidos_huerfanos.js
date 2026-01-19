// Script para corregir pedidos huérfanos (sin registros de producción)
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

// Polyfill básico
if (!global.window) {
    global.window = {};
}

const sql = neon(process.env.VITE_DATABASE_URL);

// IDs identificados en el diagnóstico
const PEDIDOS_A_CORREGIR = [2, 14, 15, 19];

async function main() {
    console.log('🛠️ INICIANDO REPARACIÓN DE PEDIDOS HUÉRFANOS (V2) 🛠️');
    console.log('================================================');

    for (const idPedido of PEDIDOS_A_CORREGIR) {
        try {
            console.log(`\nProcesando Pedido #${idPedido}...`);

            // 1. Verificar estado actual
            const [pedido] = await sql`
                SELECT id_pedido, nombre_cliente, estado_produccion, estado_pedido 
                FROM pedidos WHERE id_pedido = ${idPedido}
            `;

            if (!pedido) {
                console.log(`❌ Pedido #${idPedido} no encontrado.`);
                continue;
            }

            console.log(`   - Cliente: ${pedido.nombre_cliente}`);
            console.log(`   - Estado Prod: ${pedido.estado_produccion}`);

            // 2. Verificar registros
            const count = await sql`
                SELECT COUNT(*) as c FROM produccion_taller WHERE pedido_id = ${idPedido}
            `;

            if (parseInt(count[0].c) > 0) {
                console.log(`⚠️  El pedido ya tiene ${count[0].c} registros. Saltando...`);
                continue;
            }

            // 3. Obtener detalles
            const detalles = await sql`
                SELECT * FROM detalles_pedido WHERE id_pedido = ${idPedido}
            `;

            if (detalles.length === 0) {
                console.log('❌ El pedido no tiene productos/detalles.');
                continue;
            }

            console.log(`   - Creando producción para ${detalles.length} productos...`);

            // 4. Crear registros
            for (const d of detalles) {

                await sql`
                    INSERT INTO produccion_taller (
                        pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto,
                        cantidad, costo_materiales, mano_de_obra, porcentaje_alquiler,
                        costo_herramientas, otros_gastos, estado_produccion, observaciones, 
                        fecha_produccion
                    ) VALUES (
                        ${idPedido},
                        'PEDIDO',
                        ${d.metal || 'Plata'},
                        ${d.tipo_producto || 'Joya'},
                        ${d.nombre_producto || 'Producto Personalizado'},
                        ${d.cantidad || 1},
                        0, 0, 0, 0, 0,
                        ${pedido.estado_produccion || 'en_proceso'}, 
                        ${`Recuperación automática de pedido #${idPedido}`},
                        ${new Date().toISOString().split('T')[0]}
                    )
                `;
                console.log(`     ✓ Creado: ${d.nombre_producto}`);
            }

        } catch (error) {
            console.error(`❌ Error procesando pedido #${idPedido}:`, error);
        }
    }

    console.log('\n================================================');
    console.log('🎉 PROCESO DE REPARACIÓN FINALIZADO');
}

main().catch(console.error);

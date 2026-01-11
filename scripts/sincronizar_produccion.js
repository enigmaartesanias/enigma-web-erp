// Script para sincronizar pedidos en producción con la tabla produccion_taller
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.VITE_DATABASE_URL);

async function sincronizarProduccion() {
    console.log('🔄 Sincronizando pedidos con producción...\n');

    // 1. Buscar pedidos con estado_produccion = 'en_proceso' 
    const pedidosEnProduccion = await sql`
        SELECT p.id_pedido, p.nombre_cliente, p.metal, p.tipo_producto,
               d.id_detalle, d.nombre_producto, d.cantidad, d.tipo_producto as producto_tipo, d.metal as producto_metal
        FROM pedidos p
        INNER JOIN detalles_pedido d ON p.id_pedido = d.id_pedido
        WHERE p.estado_produccion = 'en_proceso'
        ORDER BY p.id_pedido
    `;

    console.log(`📦 Pedidos en producción encontrados: ${pedidosEnProduccion.length} productos\n`);

    if (pedidosEnProduccion.length === 0) {
        console.log('✅ No hay pedidos pendientes de sincronizar');
        return;
    }

    // 2. Para cada producto del pedido, verificar si existe en produccion_taller
    let creados = 0;
    let yaExistentes = 0;

    for (const producto of pedidosEnProduccion) {
        // Verificar si ya existe
        const existe = await sql`
            SELECT id_produccion 
            FROM produccion_taller
            WHERE pedido_id = ${producto.id_pedido}
            AND nombre_producto LIKE ${'%' + producto.nombre_producto + '%'}
        `;

        if (existe.length > 0) {
            console.log(`⏭️  Ya existe: Pedido #${producto.id_pedido} - ${producto.nombre_producto}`);
            yaExistentes++;
            continue;
        }

        // Crear registro de producción
        const nombreProducto = `${producto.nombre_cliente} - ${producto.nombre_producto}`;

        await sql`
            INSERT INTO produccion_taller (
                pedido_id, tipo_produccion, metal, tipo_producto, nombre_producto,
                cantidad, costo_materiales, mano_de_obra, porcentaje_alquiler,
                costo_herramientas, otros_gastos, estado_produccion, observaciones
            ) VALUES (
                ${producto.id_pedido},
                'PEDIDO',
                ${producto.producto_metal || producto.metal || 'Plata'},
                ${producto.producto_tipo || producto.tipo_producto || 'Anillo'},
                ${nombreProducto},
                ${producto.cantidad},
                0, 0, 0, 0, 0,
                'en_proceso',
                'Sincronizado automáticamente desde pedidos'
            )
        `;

        console.log(`✅ Creado: Pedido #${producto.id_pedido} - ${producto.nombre_producto}`);
        creados++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Registros creados: ${creados}`);
    console.log(`   ⏭️  Ya existentes: ${yaExistentes}`);
    console.log(`\n🎉 Sincronización completa!`);
}

sincronizarProduccion().catch(console.error);

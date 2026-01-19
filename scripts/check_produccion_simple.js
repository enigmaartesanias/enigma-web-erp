// Script simple para verificar producción
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.VITE_DATABASE_URL);

async function main() {
    // Ver registros de producción tipo PEDIDO
    const pedidos = await sql`
        SELECT 
            id_produccion,
            pedido_id,
            nombre_producto,
            estado_produccion,
            tipo_produccion
        FROM produccion_taller
        WHERE tipo_produccion = 'PEDIDO'
        ORDER BY created_at DESC
    `;

    console.log('=== REGISTROS DE PRODUCCIÓN TIPO PEDIDO ===');
    if (pedidos.length === 0) {
        console.log('❌ NO HAY REGISTROS DE TIPO PEDIDO');
    } else {
        console.table(pedidos);
    }

    // Ver todos los registros
    const todos = await sql`
        SELECT COUNT(*) as total FROM produccion_taller
    `;
    console.log(`\nTotal de registros en produccion_taller: ${todos[0].total}`);

    // Ver pedidos #19 y #15
    const pedidosCheck = await sql`
        SELECT id_pedido, nombre_cliente, estado_produccion
        FROM pedidos
        WHERE id_pedido IN (19, 15)
    `;
    console.log('\n=== ESTADO DE PEDIDOS #19 Y #15 ===');
    console.table(pedidosCheck);
}

main().catch(console.error);

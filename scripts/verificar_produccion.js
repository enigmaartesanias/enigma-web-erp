// Script para verificar registros de producción en la base de datos
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function verificarProduccion() {
    console.log('🔍 Verificando registros de producción...\n');

    // Obtener todos los registros de produccion_taller
    const registros = await sql`
        SELECT 
            id_produccion,
            pedido_id,
            tipo_produccion,
            nombre_producto,
            estado_produccion,
            created_at
        FROM produccion_taller
        ORDER BY created_at DESC
        LIMIT 10
    `;

    console.log('📋 Últimos 10 registros en produccion_taller:');
    console.table(registros);

    // Verificar específicamente pedidos #019 y #015
    const pedidos = await sql`
        SELECT 
            id_pedido,
            nombre_cliente,
            estado_produccion
        FROM pedidos
        WHERE id_pedido IN (19, 15)
    `;

    console.log('\n📦 Estado de pedidos #019 y #015:');
    console.table(pedidos);

    // Buscar registros de producción para esos pedidos
    const produccionPedidos = await sql`
        SELECT *
        FROM produccion_taller
        WHERE pedido_id IN (19, 15)
    `;

    console.log('\n🔨 Registros de producción para pedidos #019 y #015:');
    console.table(produccionPedidos);

    // Contar registros por estado
    const stats = await sql`
        SELECT 
            estado_produccion,
            COUNT(*) as cantidad
        FROM produccion_taller
        GROUP BY estado_produccion
    `;

    console.log('\n📊 Estadísticas por estado:');
    console.table(stats);
}

verificarProduccion().catch(console.error);

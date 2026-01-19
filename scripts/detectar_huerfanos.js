// Script para detectar inconsistencias y pedidos "huérfanos"
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const sql = neon(process.env.VITE_DATABASE_URL);

async function main() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    log('🔍 INICIANDO DIAGNÓSTICO DE INCONSISTENCIA PEDIDOS-PRODUCCIÓN 🔍');
    log('===============================================================');

    // 1. Detectar pedidos en estado producción sin registros en produccion_taller (HUÉRFANOS)
    log('\n1. Buscando pedidos HUÉRFANOS (Estado Producción sin registros en Taller)...');

    // Normalizar estados para la búsqueda
    const pedidosProduccion = await sql`
        SELECT id_pedido, nombre_cliente, fecha_pedido, estado_pedido, estado_produccion
        FROM pedidos
        WHERE estado_produccion NOT IN ('no_iniciado', 'pendiente', '') 
           OR estado_produccion IS NULL 
    `;

    let huerfanos = [];
    let conRegistros = 0;

    for (const p of pedidosProduccion) {
        // Verificar si existe en la tabla produccion_taller
        const registros = await sql`
            SELECT COUNT(*) as count FROM produccion_taller WHERE pedido_id = ${p.id_pedido}
        `;

        if (parseInt(registros[0].count) === 0) {
            huerfanos.push(p);
        } else {
            conRegistros++;
        }
    }

    if (huerfanos.length > 0) {
        log(`❌ SE ENCONTRARON ${huerfanos.length} PEDIDOS HUÉRFANOS:`);
        huerfanos.forEach(p => {
            log(`- ID: ${p.id_pedido} | Cliente: ${p.nombre_cliente} | Fecha: ${p.fecha_pedido ? new Date(p.fecha_pedido).toISOString().split('T')[0] : 'N/A'} | EstadoProd: ${p.estado_produccion}`);
        });
    } else {
        log('✅ No se encontraron pedidos huérfanos. Todo pedido en producción tiene registros.');
    }

    // 2. Detectar registros de producción que están ocultos por el filtro de 2026
    log('\n2. Buscando producción OCULTA por filtros de año (2025)...');

    const produccionOculta = await sql`
        SELECT 
            id_produccion, 
            pedido_id, 
            nombre_producto, 
            fecha_produccion, 
            estado_produccion,
            created_at
        FROM produccion_taller
        WHERE 
            tipo_produccion = 'PEDIDO' AND
            (fecha_produccion < '2026-01-01' OR created_at < '2026-01-01') AND
            estado_produccion != 'en_proceso' -- Estos suelen mostrarse siempre por la excepción en el código
    `;

    if (produccionOculta.length > 0) {
        log(`⚠️  SE ENCONTRARON ${produccionOculta.length} REGISTROS DE 2025 (Posiblemente Ocultos si no están en proceso):`);
        produccionOculta.forEach(p => {
            log(`- ID: ${p.id_produccion} | Pedido: ${p.pedido_id} | Producto: ${p.nombre_producto} | Fecha: ${p.fecha_produccion ? new Date(p.fecha_produccion).toISOString().split('T')[0] : 'N/A'} | Estado: ${p.estado_produccion}`);
        });
    } else {
        log('ℹ️  No hay registros de producción de 2025 que no estén "en_proceso".');
    }

    // 3. Revisar pedidos específicos que el usuario mencionó (si sabemos cuáles son)
    // El usuario mencionó pedidos en Diciembre 2025.
    log('\n3. Revisión de Pedidos de Diciembre 2025...');
    const pedidosDic2025 = await sql`
        SELECT id_pedido, nombre_cliente, fecha_pedido, estado_produccion
        FROM pedidos
        WHERE fecha_pedido BETWEEN '2025-12-01' AND '2025-12-31'
    `;

    if (pedidosDic2025.length > 0) {
        for (const p of pedidosDic2025) {
            const count = await sql`SELECT COUNT(*) as c FROM produccion_taller WHERE pedido_id = ${p.id_pedido}`;
            log(`- Pedido #${p.id_pedido} (${p.nombre_cliente}): ${count[0].c} registros en producción. Estado Actual: ${p.estado_produccion}`);
        }
    } else {
        log('   No se encontraron pedidos en Dic 2025.');
    }

    log('\n===============================================================');
    log('✅ DIAGNÓSTICO COMPLETADO');

    fs.writeFileSync('diagnostic_results.txt', output);
    console.log('Resultados guardados en diagnostic_results.txt');
}

main().catch(console.error);

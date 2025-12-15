import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

async function testCreate() {
    console.log('🧪 Iniciando prueba de creación de pedido...');

    const pedidoData = {
        nombre_cliente: 'Test User',
        telefono: '999999999',
        dni_ruc: '12345678',
        direccion_entrega: 'Test Address',
        metal: 'Oro 18k',
        tipo_producto: 'Anillo',
        forma_pago: 'Efectivo',
        comprobante_pago: '',
        requiere_envio: false,
        modalidad_envio: 'Fijo',
        envio_cobrado_al_cliente: 0,
        envio_referencia: 0,
        precio_total_sin_igv: 100,
        precio_total: 100,
        monto_a_cuenta: 50,
        monto_igv: 0,
        monto_saldo: 50,
        entregado: false,
        cancelado: false,
        incluye_igv: false
    };

    try {
        console.log('📝 Datos a insertar:', pedidoData);

        // Simular la query de pedidosDB.create
        const [pedido] = await sql`
      INSERT INTO pedidos (
        nombre_cliente, telefono, dni_ruc, direccion_entrega,
        metal, tipo_producto,
        forma_pago, comprobante_pago, requiere_envio, modalidad_envio,
        envio_cobrado_al_cliente, envio_referencia,
        precio_total_sin_igv, precio_total, monto_a_cuenta,
        monto_igv, monto_saldo, entregado, cancelado, incluye_igv
      ) VALUES (
        ${pedidoData.nombre_cliente}, ${pedidoData.telefono}, ${pedidoData.dni_ruc},
        ${pedidoData.direccion_entrega},
        ${pedidoData.metal}, ${pedidoData.tipo_producto},
        ${pedidoData.forma_pago}, ${pedidoData.comprobante_pago},
        ${pedidoData.requiere_envio}, ${pedidoData.modalidad_envio},
        ${pedidoData.envio_cobrado_al_cliente}, ${pedidoData.envio_referencia || 0},
        ${pedidoData.precio_total_sin_igv}, ${pedidoData.precio_total}, ${pedidoData.monto_a_cuenta},
        ${pedidoData.monto_igv}, ${pedidoData.monto_saldo}, ${pedidoData.entregado || false},
        ${pedidoData.cancelado}, ${pedidoData.incluye_igv}
      )
      RETURNING *
    `;

        console.log('✅ Pedido creado exitosamente:', pedido);

        // Limpiar
        await sql`DELETE FROM pedidos WHERE id_pedido = ${pedido.id_pedido}`;
        console.log('🗑️ Pedido de prueba eliminado.');

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        console.error('Detalles:', error.message);
    }
}

testCreate();

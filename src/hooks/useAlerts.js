import { useState, useEffect } from 'react';
import { pedidosDB } from '../utils/pedidosNeonClient';


export function useAlerts() {
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAlerts();
    }, []);

    const checkAlerts = async () => {
        try {
            const pedidos = await pedidosDB.getAll();
            console.log('📊 Total pedidos:', pedidos.length);

            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
            console.log('📅 Fecha de hoy (normalizada):', hoy.toLocaleDateString());

            // Verificar pedidos atrasados - solo activos (pendiente o en_proceso)
            const atrasados = pedidos.filter(p => {
                // Solo considerar pedidos activos
                const esActivo = p.estado === 'pendiente' || p.estado === 'en_proceso';
                if (!esActivo) {
                    return false;
                }

                if (!p.fecha_entrega) {
                    console.log(`⚠️ Pedido ${p.id_pedido} sin fecha de entrega`);
                    return false;
                }

                const fechaEntrega = new Date(p.fecha_entrega);
                fechaEntrega.setHours(0, 0, 0, 0);

                const estaAtrasado = fechaEntrega < hoy;

                if (estaAtrasado) {
                    console.log(`🔴 Pedido ${p.id_pedido} atrasado:`, {
                        cliente: p.nombre_cliente,
                        estado: p.estado,
                        fecha_entrega: fechaEntrega.toLocaleDateString(),
                        dias_atraso: Math.floor((hoy - fechaEntrega) / (1000 * 60 * 60 * 24))
                    });
                }

                return estaAtrasado;
            });
            console.log('🔴 Total pedidos atrasados:', atrasados.length);

            // Verificar pedidos pendientes (sin producción iniciada)
            const pendientes = pedidos.filter(p =>
                p.estado === 'pendiente' && !p.produccion_iniciada
            );
            console.log('🟡 Pedidos pendientes sin iniciar:', pendientes.length);

            // Determinar mensaje (prioridad: atrasados > pendientes)
            if (atrasados.length > 0) {
                setAlertMessage(`${atrasados.length} pedido${atrasados.length > 1 ? 's' : ''} con fecha de entrega vencida`);
                console.log('✅ Mostrando alerta de atrasados');
            } else if (pendientes.length > 0) {
                setAlertMessage(`${pendientes.length} pedido${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''} de atención`);
                console.log('✅ Mostrando alerta de pendientes');
            } else {
                setAlertMessage('');
                console.log('✅ Sin alertas');
            }

            setLoading(false);
        } catch (error) {
            console.error('❌ Error checking alerts:', error);
            setLoading(false);
        }
    };

    return { alertMessage, loading };
}

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

            // Verificar pedidos atrasados
            const atrasados = pedidos.filter(p => {
                if (p.estado === 'entregado' || p.estado === 'cancelado') return false;
                if (!p.fecha_entrega) return false;

                const fechaEntrega = new Date(p.fecha_entrega);
                fechaEntrega.setHours(0, 0, 0, 0);

                return fechaEntrega < hoy;
            });
            console.log('🔴 Pedidos atrasados:', atrasados.length, atrasados);

            // Verificar pedidos pendientes (sin producción iniciada)
            const pendientes = pedidos.filter(p =>
                p.estado === 'pendiente' && !p.produccion_iniciada
            );
            console.log('🟡 Pedidos pendientes:', pendientes.length, pendientes);

            // Determinar mensaje (prioridad: atrasados > pendientes)
            if (atrasados.length > 0) {
                setAlertMessage('Hay pedidos con fecha de entrega vencida');
                console.log('✅ Mostrando alerta de atrasados');
            } else if (pendientes.length > 0) {
                setAlertMessage('Hay pedidos pendientes de atención');
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

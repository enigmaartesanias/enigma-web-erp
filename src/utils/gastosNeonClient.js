import { neon } from '@neondatabase/serverless';
import { getLocalDate } from './dateUtils';

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;
const sql = neon(DATABASE_URL);

export const gastosDB = {
    // Obtener todos los gastos de un periodo (mes)
    async getByPeriodo(periodo) {
        try {
            const data = await sql`
                SELECT * FROM gastos 
                WHERE periodo = ${periodo}
                ORDER BY 
                    CASE WHEN tipo_gasto = 'FIJO' THEN fecha_vencimiento END ASC,
                    created_at DESC
            `;
            return data;
        } catch (error) {
            console.error('Error fetching gastos:', error);
            throw error;
        }
    },

    // Crear nuevo gasto
    async create(gasto) {
        try {
            const [newGasto] = await sql`
                INSERT INTO gastos (
                    tipo_gasto,
                    categoria,
                    descripcion,
                    monto,
                    fecha_vencimiento,
                    fecha_pago,
                    estado,
                    periodo
                ) VALUES (
                    ${gasto.tipo_gasto},
                    ${gasto.categoria},
                    ${gasto.descripcion || ''},
                    ${gasto.monto},
                    ${gasto.fecha_vencimiento || null},
                    ${gasto.fecha_pago || null},
                    ${gasto.estado || 'PENDIENTE'},
                    ${gasto.periodo}
                )
                RETURNING *
            `;
            return newGasto;
        } catch (error) {
            console.error('Error creating gasto:', error);
            throw error;
        }
    },

    // Marcar como pagado
    async markAsPaid(id, fechaPago) {
        try {
            const [updated] = await sql`
                UPDATE gastos 
                SET 
                    estado = 'PAGADO',
                    fecha_pago = ${fechaPago || getLocalDate()}
                WHERE id_gasto = ${id}
                RETURNING *
            `;
            return updated;
        } catch (error) {
            console.error('Error updating gasto:', error);
            throw error;
        }
    },

    // Eliminar gasto
    async delete(id) {
        try {
            await sql`DELETE FROM gastos WHERE id_gasto = ${id}`;
            return true;
        } catch (error) {
            console.error('Error deleting gasto:', error);
            throw error;
        }
    },

    // Quick Update (para editar montos o detalles simples)
    async update(id, data) {
        try {
            const [updated] = await sql`
                UPDATE gastos 
                SET 
                    categoria = ${data.categoria},
                    descripcion = ${data.descripcion},
                    monto = ${data.monto},
                    fecha_vencimiento = ${data.fecha_vencimiento}
                WHERE id_gasto = ${id}
                RETURNING *
            `;
            return updated;
        } catch (error) {
            console.error('Error updating gasto detail:', error);
            throw error;
        }
    }
};

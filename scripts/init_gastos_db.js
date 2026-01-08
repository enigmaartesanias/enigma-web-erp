import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.VITE_DATABASE_URL);

async function initDB() {
    console.log('Iniciando creación de tabla gastos...');
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS gastos (
                id_gasto SERIAL PRIMARY KEY,
                tipo_gasto VARCHAR(20) NOT NULL, -- 'FIJO' o 'VARIABLE'
                categoria VARCHAR(50) NOT NULL, -- 'Alquiler', 'Movilidad', etc.
                descripcion TEXT,
                monto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                fecha_vencimiento DATE, -- Obligatorio para FIJO
                fecha_pago DATE, -- Fecha real de pago
                estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'PAGADO'
                periodo VARCHAR(7) NOT NULL, -- '2026-01'
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sql`CREATE INDEX IF NOT EXISTS idx_gastos_periodo ON gastos(periodo);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos(tipo_gasto);`;

        console.log('✅ Tabla gastos creada correctamente.');
    } catch (error) {
        console.error('❌ Error creando tabla:', error);
    }
}

initDB();

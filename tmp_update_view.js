import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.VITE_DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ VITE_DATABASE_URL no está configurada');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function updateDB() {
  try {
    console.log('🔄 Actualizando vista v_reporte_financiero_mensual...');
    
    await sql`
CREATE OR REPLACE VIEW v_reporte_financiero_mensual AS
WITH
ingresos AS (
  SELECT
    TO_CHAR(fecha_pedido AT TIME ZONE 'America/Lima', 'YYYY-MM') AS periodo,
    SUM(precio_total_sin_igv)              AS total_ingresos,
    COUNT(*)                               AS num_pedidos,
    SUM(CASE WHEN COALESCE(origen_pedido,'INTERNET') = 'INTERNET'
      THEN precio_total_sin_igv ELSE 0 END) AS ventas_internet,
    SUM(CASE WHEN origen_pedido = 'TIENDA'
      THEN precio_total_sin_igv ELSE 0 END) AS ventas_tienda
  FROM pedidos
  WHERE estado_pedido IN ('entregado', 'aceptado')
    AND monto_a_cuenta > 0       -- solo pedidos que tienen al menos un pago
  GROUP BY 1
),
costos AS (
  SELECT
    TO_CHAR(fecha_produccion, 'YYYY-MM')     AS periodo,
    SUM(costo_materiales)                    AS total_materiales,
    SUM(mano_de_obra)                        AS total_mano_obra,
    SUM(costo_herramientas)                  AS total_herramientas,
    SUM(COALESCE(costo_empaque,0))           AS total_empaque,
    SUM(COALESCE(costo_envio_asumido,0))     AS total_envio,
    COUNT(*)                                 AS piezas_producidas
  FROM produccion_taller
  WHERE estado_produccion = 'terminado'
  GROUP BY 1
),
gastos_mes AS (
  SELECT
    periodo,
    SUM(CASE WHEN tipo_gasto='FIJO'     THEN monto ELSE 0 END) AS gastos_fijos,
    SUM(CASE WHEN tipo_gasto='VARIABLE' THEN monto ELSE 0 END) AS gastos_variables
  FROM gastos
  GROUP BY 1
)
SELECT
  COALESCE(i.periodo, c.periodo, g.periodo)  AS periodo,
  COALESCE(i.total_ingresos, 0)              AS ingresos_total,
  COALESCE(i.ventas_internet, 0)             AS ventas_internet,
  COALESCE(i.ventas_tienda, 0)               AS ventas_tienda,
  COALESCE(i.num_pedidos, 0)                 AS num_pedidos,
  COALESCE(c.total_materiales, 0)            AS costo_materiales,
  COALESCE(c.total_mano_obra, 0)             AS costo_mano_obra,
  COALESCE(c.total_herramientas, 0)          AS costo_herramientas,
  COALESCE(c.total_empaque, 0)               AS costo_empaque,
  COALESCE(c.total_envio, 0)                 AS costo_envio,
  COALESCE(c.piezas_producidas, 0)           AS piezas_producidas,
  COALESCE(g.gastos_fijos, 0)                AS gastos_fijos,
  COALESCE(g.gastos_variables, 0)            AS gastos_variables,
  -- RESULTADO NETO
  COALESCE(i.total_ingresos, 0)
    - COALESCE(c.total_materiales, 0)
    - COALESCE(c.total_herramientas, 0)
    - COALESCE(c.total_empaque, 0)
    - COALESCE(c.total_envio, 0)
    - COALESCE(g.gastos_fijos, 0)
    - COALESCE(g.gastos_variables, 0)        AS resultado_neto,
  -- PUNTO DE EQUILIBRIO: pulseras cobre a S/80 necesarias
  CEIL((COALESCE(g.gastos_fijos,0) + 64.58) / 80.0) AS pulseras_equilibrio_80,
  CEIL((COALESCE(g.gastos_fijos,0) + 64.58) / 50.0) AS pulseras_equilibrio_50
FROM ingresos i
FULL OUTER JOIN costos c     ON i.periodo = c.periodo
FULL OUTER JOIN gastos_mes g ON i.periodo = g.periodo
ORDER BY periodo DESC;
    `;
    
    console.log('✅ Vista actualizada con éxito');
  } catch (error) {
    console.error('❌ Error actualizando vista:', error);
  }
}

updateDB();

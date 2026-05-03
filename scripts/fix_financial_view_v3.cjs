// scripts/fix_financial_view_v3.cjs
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.VITE_DATABASE_URL);

const updateView = `
CREATE VIEW v_reporte_financiero_mensual AS
WITH
ingresos AS (
  SELECT
    TO_CHAR(fecha_venta AT TIME ZONE 'America/Lima', 'YYYY-MM') AS periodo,
    SUM(total) AS total_ingresos,
    SUM(CASE WHEN origen_venta = 'pedido' THEN total ELSE 0 END) AS ingresos_pedidos,
    SUM(CASE WHEN origen_venta = 'stock' THEN total ELSE 0 END) AS ingresos_stock,
    COUNT(*) FILTER (WHERE origen_venta = 'pedido') AS num_pedidos,
    COUNT(*) FILTER (WHERE origen_venta = 'stock') AS num_ventas,
    SUM(CASE WHEN forma_pago IN ('Tarjeta', 'Transferencia', 'Yape', 'Plin') THEN total ELSE 0 END) AS ingresos_digital,
    SUM(CASE WHEN forma_pago = 'Efectivo' THEN total ELSE 0 END) AS ingresos_efectivo
  FROM ventas
  WHERE estado != 'ANULADA'
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
  COALESCE(i.periodo, c.periodo, g.periodo)   AS periodo,
  COALESCE(i.total_ingresos, 0)               AS ingresos_total,
  COALESCE(i.ingresos_pedidos, 0)             AS ingresos_pedidos,
  COALESCE(i.ingresos_stock, 0)               AS ingresos_stock,
  COALESCE(i.num_pedidos, 0)                 AS num_pedidos,
  COALESCE(i.num_ventas, 0)                  AS num_ventas,
  COALESCE(i.ingresos_digital, 0)            AS ingresos_digital,
  COALESCE(i.ingresos_efectivo, 0)           AS ingresos_efectivo,
  COALESCE(c.total_materiales, 0)            AS costo_materiales,
  COALESCE(c.total_mano_obra, 0)             AS costo_mano_obra,
  COALESCE(c.total_herramientas, 0)          AS costo_herramientas,
  COALESCE(c.total_empaque, 0)               AS costo_empaque,
  COALESCE(c.total_envio, 0)                 AS costo_envio,
  COALESCE(c.piezas_producidas, 0)           AS piezas_producidas,
  COALESCE(g.gastos_fijos, 0)               AS gastos_fijos,
  COALESCE(g.gastos_variables, 0)           AS gastos_variables,
  -- RESULTADO NETO
  COALESCE(i.total_ingresos, 0)
    - COALESCE(c.total_materiales, 0)
    - COALESCE(c.total_mano_obra, 0)
    - COALESCE(c.total_herramientas, 0)
    - COALESCE(c.total_empaque, 0)
    - COALESCE(c.total_envio, 0)
    - COALESCE(g.gastos_fijos, 0)
    - COALESCE(g.gastos_variables, 0)         AS resultado_neto,
  -- PUNTO DE EQUILIBRIO
  CEIL((COALESCE(g.gastos_fijos,0) + 64.58) / 80.0) AS pulseras_equilibrio_80,
  CEIL((COALESCE(g.gastos_fijos,0) + 64.58) / 50.0) AS pulseras_equilibrio_50
FROM ingresos i
FULL OUTER JOIN costos c     ON i.periodo = c.periodo
FULL OUTER JOIN gastos_mes g ON COALESCE(i.periodo, c.periodo) = g.periodo
ORDER BY periodo DESC;
`;

(async () => {
  try {
    await sql`DROP VIEW IF EXISTS v_reporte_financiero_mensual CASCADE;`;
    await sql.query(updateView);
    console.log("Financial View updated successfully with correct JOIN logic.");
  } catch (e) {
    console.error("Failed to update view:", e);
    process.exit(1);
  }
})();

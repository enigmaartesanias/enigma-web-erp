// src/utils/dashboardNeonClient.js
// Cliente Neon para el dashboard financiero de Enigma

import { neon } from '@neondatabase/serverless';
const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const dashboardDB = {

  getReporteMensual: async (periodo) => {
    // periodo formato: 'YYYY-MM'
    const rows = await sql`
      SELECT * FROM v_reporte_financiero_mensual
      WHERE periodo = ${periodo}
    `;
    return rows[0] || null;
  },

  getHistorial: async (meses = 6) => {
    const rows = await sql`
      SELECT * FROM v_reporte_financiero_mensual
      LIMIT ${meses}
    `;
    return rows;
  },

  getTotalDeudas: async () => {
    const [row] = await sql`
      SELECT COALESCE(SUM(monto_total - monto_pagado), 0) AS total,
             COUNT(*) FILTER (
               WHERE fecha_vencimiento < CURRENT_DATE
                 AND (monto_total - monto_pagado) > 0
             ) AS vencidas
      FROM deudas
      WHERE (monto_total - monto_pagado) > 0
    `;
    return { total: parseFloat(row.total), vencidas: parseInt(row.vencidas) };
  },

  getPiezasMes: async () => {
    const [row] = await sql`
      SELECT COUNT(*) AS total
      FROM produccion_taller
      WHERE DATE_TRUNC('month', fecha_produccion) = DATE_TRUNC('month', CURRENT_DATE)
        AND estado_produccion = 'terminado'
    `;
    return parseInt(row.total) || 1;
  }
};

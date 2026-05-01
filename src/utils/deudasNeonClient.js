// src/utils/deudasNeonClient.js
// Cliente Neon para gestión de deudas de Enigma Artesanías

import { neon } from '@neondatabase/serverless';
const sql = neon(import.meta.env.VITE_DATABASE_URL);

export const deudasDB = {

  getAll: async () => {
    const rows = await sql`
      SELECT *,
        (monto_total - monto_pagado) AS monto_pendiente,
        CASE
          WHEN (monto_total - monto_pagado) <= 0 THEN 'AL_DIA'
          WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
          ELSE 'PENDIENTE'
        END AS estado_calculado
      FROM deudas
      ORDER BY
        CASE WHEN fecha_vencimiento < CURRENT_DATE THEN 0 ELSE 1 END,
        fecha_vencimiento ASC NULLS LAST
    `;
    return rows;
  },

  create: async (data) => {
    const [row] = await sql`
      INSERT INTO deudas (acreedor, tipo, monto_total, fecha_vencimiento, estado, notas)
      VALUES (${data.acreedor}, ${data.tipo}, ${data.monto_total},
              ${data.fecha_vencimiento || null}, 'PENDIENTE', ${data.notas || null})
      RETURNING *
    `;
    return row;
  },

  // -----------------------------------------------------
  // NUEVA FUNCIÓN AÑADIDA: Para poder editar deudas
  // -----------------------------------------------------
  update: async (id, data) => {
    const [row] = await sql`
      UPDATE deudas
      SET acreedor = ${data.acreedor},
          tipo = ${data.tipo},
          monto_total = ${data.monto_total},
          fecha_vencimiento = ${data.fecha_vencimiento || null},
          notas = ${data.notas || null}
      WHERE id = ${id}
      RETURNING *
    `;
    return row;
  },

  registrarPago: async (deudaId, { monto, fecha_pago, metodo_pago, nota }) => {
    await sql`
      INSERT INTO deuda_pagos (deuda_id, monto, fecha_pago, metodo_pago, nota)
      VALUES (${deudaId}, ${monto}, ${fecha_pago}, ${metodo_pago || null}, ${nota || null})
    `;
    await sql`
      UPDATE deudas
      SET monto_pagado = monto_pagado + ${monto},
          estado = CASE
            WHEN (monto_pagado + ${monto}) >= monto_total THEN 'AL_DIA'
            ELSE estado
          END
      WHERE id = ${deudaId}
    `;
  },

  getTotalPendiente: async () => {
    const [row] = await sql`
      SELECT COALESCE(SUM(monto_total - monto_pagado), 0) AS total
      FROM deudas
      WHERE (monto_total - monto_pagado) > 0
    `;
    return parseFloat(row.total);
  },

  getVencidas: async () => {
    const rows = await sql`
      SELECT * FROM deudas
      WHERE fecha_vencimiento < CURRENT_DATE
        AND (monto_total - monto_pagado) > 0
      ORDER BY fecha_vencimiento ASC
    `;
    return rows;
  },

  getPagos: async (deudaId) => {
    const rows = await sql`
      SELECT * FROM deuda_pagos
      WHERE deuda_id = ${deudaId}
      ORDER BY fecha_pago DESC
    `;
    return rows;
  },

  delete: async (id) => {
    await sql`DELETE FROM deudas WHERE id = ${id}`;
  }
};
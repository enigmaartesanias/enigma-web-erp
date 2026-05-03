// debug_ventas.js
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function debug() {
  try {
    console.log("Checking Ventas for May 2026...");
    const rows = await sql`
      SELECT id, codigo_venta, fecha_venta, total, origen_venta, estado
      FROM ventas
      WHERE TO_CHAR(fecha_venta AT TIME ZONE 'America/Lima', 'YYYY-MM') = '2026-05'
    `;
    console.log("Rows found:", rows.length);
    rows.forEach(r => {
      console.log(`ID: ${r.id}, Code: ${r.codigo_venta}, Date: ${r.fecha_venta}, Total: ${r.total}, Origen: ${r.origen_venta}, Estado: ${r.estado}`);
    });

    const report = await sql`SELECT * FROM v_reporte_financiero_mensual WHERE periodo = '2026-05'`;
    console.log("View Report for 2026-05:", JSON.stringify(report[0], null, 2));

  } catch (e) {
    console.error(e);
  }
}

debug();

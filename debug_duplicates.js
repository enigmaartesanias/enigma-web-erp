// debug_duplicates.js
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function debug() {
  try {
    console.log("Checking for duplicates in v_reporte_financiero_mensual...");
    const rows = await sql`
      SELECT periodo, COUNT(*) as count
      FROM v_reporte_financiero_mensual
      GROUP BY periodo
      HAVING COUNT(*) > 1
    `;
    
    if (rows.length === 0) {
      console.log("No duplicates found in the view itself.");
    } else {
      console.log("Duplicates found in view:", rows);
      for (const r of rows) {
        const details = await sql`SELECT * FROM v_reporte_financiero_mensual WHERE periodo = ${r.periodo}`;
        console.log(`Details for ${r.periodo}:`, JSON.stringify(details, null, 2));
      }
    }

    // Check raw CTE sources
    console.log("\nChecking Ingresos Periods:");
    const ing = await sql`SELECT TO_CHAR(fecha_venta AT TIME ZONE 'America/Lima', 'YYYY-MM') as p, COUNT(*) FROM ventas GROUP BY 1`;
    console.log(ing);

    console.log("\nChecking Costos Periods:");
    const cos = await sql`SELECT TO_CHAR(fecha_produccion, 'YYYY-MM') as p, COUNT(*) FROM produccion_taller GROUP BY 1`;
    console.log(cos);

    console.log("\nChecking Gastos Periods:");
    const gas = await sql`SELECT periodo, COUNT(*) FROM gastos GROUP BY 1`;
    console.log(gas);

  } catch (e) {
    console.error(e);
  }
}

debug();

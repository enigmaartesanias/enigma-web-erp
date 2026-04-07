import { neon } from '@neondatabase/serverless';
const sql = neon("postgresql://neondb_owner:npg_PIU3bHc7oXTt@ep-bitter-pond-ahd82tev-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function check() {
  try {
    // Update it to 22.00
    const res = await sql`UPDATE productos_externos SET costo = 22.00 WHERE codigo_usuario = 'AREC40' RETURNING *`;
    console.log('Update successful:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
check();

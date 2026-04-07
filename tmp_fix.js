const { neon } = require('@neondatabase/serverless');
const sql = neon("postgresql://neondb_owner:npg_0pX1iVGYunhS@ep-rapid-sun-a5ayie5w-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require");

async function check() {
  try {
    const res = await sql`SELECT * FROM productos_externos WHERE codigo_usuario = 'AREC40'`;
    console.log(JSON.stringify(res, null, 2));
    
    // Update it to 22.00
    await sql`UPDATE productos_externos SET costo = 22.00 WHERE codigo_usuario = 'AREC40'`;
    console.log('Update successful');
  } catch (e) {
    console.error(e);
  }
}
check();

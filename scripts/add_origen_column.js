import { neon } from '@neondatabase/serverless';

// Hardcoding for immediate execution or relying on process.env from context
const sql = neon("postgresql://neondb_owner:npg_6mP8wXMeWJav@ep-round-recipe-a8774787-pooler.eastus2.azure.neon.tech/neondb?sslmode=require");

async function addOrigenColumn() {
    try {
        console.log('Adding origen column to productos_externos table...');

        // Add column if it doesn't exist
        await sql`
      ALTER TABLE productos_externos 
      ADD COLUMN IF NOT EXISTS origen TEXT DEFAULT 'COMPRA'
    `;

        console.log('✅ Column origen added successfully.');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    }
}

addOrigenColumn();

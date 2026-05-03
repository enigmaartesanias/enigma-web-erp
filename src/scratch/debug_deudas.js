// src/scratch/debug_deudas.js
import { deudasDB } from '../utils/deudasNeonClient.js';

async function debug() {
    try {
        const deudas = await deudasDB.getAll();
        console.log('--- DEUDAS RAW ---');
        deudas.forEach(d => {
            console.log(`ID: ${d.id}`);
            console.log(`Acreedor: ${d.acreedor}`);
            console.log(`Notas: ${d.notas}`);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    }
}

debug();

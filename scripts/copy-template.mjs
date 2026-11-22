import { copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src  = resolve(root, 'dist/index.html');
const dest = resolve(root, 'functions/index.html');

if (!existsSync(src)) {
  console.error('❌  dist/index.html no existe. Asegúrate de ejecutar "vite build" primero.');
  process.exit(1);
}

copyFileSync(src, dest);
console.log('✅  functions/index.html actualizado correctamente desde dist/index.html');

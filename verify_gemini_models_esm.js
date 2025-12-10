import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("No se pudo leer el archivo .env", e);
}

if (!apiKey) {
    console.error("❌ No se encontró VITE_GEMINI_API_KEY en el archivo .env");
    process.exit(1);
}

console.log(`🔑 Probando API Key: ${apiKey.substring(0, 10)}...`);

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log("📡 Consultando modelos disponibles con v1beta...");
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Error ${response.status}:`, JSON.stringify(data, null, 2));
            return;
        }

        if (data.models) {
            console.log("\n✅ Modelos disponibles para tu API Key (Guardando en available_models.txt):");
            const modelNames = data.models
                .filter(m => m.name.includes("gemini"))
                .map(m => m.name.replace("models/", ""))
                .join("\n");

            console.log(modelNames);
            fs.writeFileSync("available_models.txt", modelNames);
            console.log("\n📄 Lista guardada en available_models.txt");
        } else {
            console.log("⚠️ No se encontraron modelos listados.");
        }

    } catch (error) {
        console.error("❌ Error de red o script:", error);
    }
}

listModels();

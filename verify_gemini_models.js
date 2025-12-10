const fs = require('fs');
const path = require('path');

// Manually read .env to avoid dependencies
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
        console.log("📡 Consultando modelos disponibles...");
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error(`❌ Error ${response.status}:`, JSON.stringify(data, null, 2));
            if (response.status === 404) {
                console.error("\n💡 DIAGNÓSTICO: Error 404 listando modelos significa que la API Key no tiene acceso a la API 'Generative Language API'.");
                console.error("👉 SOLUCIÓN: Ve a Google Cloud Console > APIs & Services > Enabled APIs y asegúrate de que 'Generative Language API' esté habilitada.");
            }
            return;
        }

        if (data.models) {
            console.log("\n✅ Modelos disponibles para tu API Key:");
            data.models.forEach(model => {
                if (model.name.includes("gemini")) {
                    console.log(`   - ${model.name.replace("models/", "")}`);
                }
            });
        } else {
            console.log("⚠️ No se encontraron modelos listados.");
        }

    } catch (error) {
        console.error("❌ Error de red o script:", error);
    }
}

listModels();

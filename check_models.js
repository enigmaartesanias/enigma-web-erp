import { GoogleGenerativeAI } from "@google/generative-ai";

// Clave del usuario (la que es válida)
const apiKey = "AIzaSyDfm0AFiP8OiBFYOVlfxvK8dGMYJzUyJ4c";

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Probando conexión con API Key:", apiKey.substring(0, 10) + "...");
        // No hay un método directo listModels en el SDK de cliente para web en versiones antiguas,
        // pero intentaremos instanciar el modelo flash para ver si responde o si podemos obtener info.
        // ACTUALIZACIÓN: El SDK de Node sí permite obtener modelos via ModelManager si estuviera expuesto,
        // pero para ser prácticos y no depender de versiones, haremos un fetch REST directo que es infalible.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("Error de API:", data.error);
        } else {
            console.log("Modelos Disponibles:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Versión: ${m.version})`);
                }
            });
        }

    } catch (error) {
        console.error("Error ejecutando script:", error);
    }
}

listModels();

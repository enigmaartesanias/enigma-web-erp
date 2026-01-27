// src/voice/voiceResolver.js
import { normalizeMetal } from "./metals.normalizer";
import { normalizeProduct } from "./products.normalizer";

/**
 * Orquestador central para normalización de voz
 * @param {string} step - El campo o paso que se está procesando (metal, product, etc)
 * @param {string} transcript - El texto reconocido por la Speech API
 * @returns {string|null} - El valor válido normalizado o null si no se reconoce
 */
export function resolveVoice(step, transcript) {
    if (!transcript) return null;

    switch (step) {
        case "metal":
        case "metal_producto":
            return normalizeMetal(transcript);
        case "product":
        case "tipo_producto":
            return normalizeProduct(transcript);
        default:
            return null;
    }
}

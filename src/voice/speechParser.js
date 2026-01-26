// src/voice/speechParser.js
const NUMEROS_TEXTO = {
    'un': 1, 'uno': 1, 'una': 1, 'unidad': 1, 'und': 1, 'unid': 1, 'um': 1, 'pz': 1, 'pieza': 1, 'piezas': 1,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
    'veinte': 20, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90, 'cien': 100
};

function extractNumber(text) {
    if (!text) return 0;

    // Normalizar: quitar moneda y limpiar espacios
    const cleaned = text.toLowerCase()
        .replace(/soles|sol|s\//g, '')
        .replace(/[,]/g, '.')
        .trim();

    // 1. Detección de dígitos explícitos (ej: "20", "50.5", "1")
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]);

    // 2. Detección por palabras (ej: "una unidad", "pieza", "diez soles")
    const palabras = cleaned.split(/[\s-]+/);
    let valor = 0;
    let ultimaPalabra = '';

    for (const p of palabras) {
        if (NUMEROS_TEXTO[p]) {
            // Evitar duplicados (ej: "uno uno")
            if (p === ultimaPalabra) continue;
            valor += NUMEROS_TEXTO[p];
            ultimaPalabra = p;
        }
    }
    return valor;
}

function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

function sentenceCase(str) {
    if (!str) return '';
    const text = str.trim().toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function parseSpeech(text, campoEsperado) {
    const transcript = text.toLowerCase().trim();
    const NEGATIVOS = ['no', 'ninguno', 'sin registro', 'omitir', 'paso', 'nada'];

    switch (campoEsperado) {
        case 'nombre_cliente':
            return { type: 'DATA', field: 'nombre_cliente', value: capitalize(transcript), valid: transcript.length >= 2 };
        case 'telefono':
            const phone = transcript.replace(/\D/g, '');
            return { type: 'DATA', field: 'telefono', value: phone, valid: phone.length >= 7 };
        case 'dni_ruc':
            if (NEGATIVOS.some(n => transcript.includes(n))) return { type: 'DATA', field: 'dni_ruc', value: '', valid: true };
            const doc = transcript.replace(/\D/g, '');
            return { type: 'DATA', field: 'dni_ruc', value: doc, valid: true };

        case 'metal':
            const METALES = ['plata', 'alpaca', 'cobre', 'bronce', 'oro'];
            const mMatch = METALES.find(m => transcript.includes(m));
            return { type: 'DATA', field: 'metal', value: mMatch ? capitalize(mMatch) : '', valid: !!mMatch };

        case 'tipo_producto':
            const TIPOS = ['anillo', 'arete', 'collar', 'pulsera'];
            const tMatch = TIPOS.find(t => transcript.includes(t));
            return { type: 'DATA', field: 'tipo_producto', value: tMatch ? capitalize(tMatch) : '', valid: !!tMatch };

        case 'descripcion_producto':
            return { type: 'DATA', field: 'descripcion_producto', value: sentenceCase(transcript), valid: transcript.length >= 2 };
        case 'cantidad':
            const vCant = extractNumber(transcript);
            return { type: 'DATA', field: 'cantidad', value: vCant, valid: vCant > 0 };
        case 'precio_unitario':
            const vPrec = extractNumber(transcript);
            return { type: 'DATA', field: 'precio_unitario', value: vPrec, valid: vPrec > 0 };
        default:
            return { type: 'DATA', value: transcript, valid: true };
    }
}

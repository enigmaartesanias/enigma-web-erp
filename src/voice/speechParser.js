// src/voice/speechParser.js
const NUMEROS_TEXTO = {
    'un': 1, 'uno': 1, 'una': 1, 'unidad': 1, 'unid': 1, 'unidades': 1, 'und': 1, 'um': 1, 'pz': 1, 'pieza': 1, 'piezas': 1,
    'par': 2, 'pares': 2, 'docena': 12, 'docenas': 12,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
    'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veintidos': 22, 'veintitrés': 23, 'veintitres': 23, 'veinticuatro': 24, 'veinticinco': 25,
    'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
    'cien': 100, 'ciento': 100, 'quinientos': 500, 'mil': 1000
};

function extractNumber(text) {
    if (!text) return 0;
    const cleaned = text.toLowerCase()
        .replace(/soles|sol|s\//g, '')
        .replace(/[,]/g, '.')
        .trim();

    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]);

    const palabras = cleaned.split(/[\s-]+/);
    let valor = 0;
    let ultimaPalabra = '';

    for (const p of palabras) {
        if (NUMEROS_TEXTO[p]) {
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
    const AFIRMATIVOS = ['si', 'sí', 'claro', 'activar', 'pónle', 'si requiere', 'acepta', 'con envio', 'con envío', 'aceptar'];
    const NEGATIVOS = ['no', 'ninguno', 'sin registro', 'omitir', 'paso', 'nada', 'no requiere', 'sin envio', 'sin envío', 'no hay envio', 'no por ahora', 'sin comprobante', 'sin numero', 'no hay comprobante', 'continuar'];

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

        case 'requiere_envio':
            const isAffirmative = AFIRMATIVOS.some(a => transcript.includes(a)) || transcript.includes('con envio') || transcript.includes('con envío');
            const isNegative = NEGATIVOS.some(n => transcript.includes(n)) || transcript.includes('no hay envio') || transcript.includes('no hay envío');

            return { type: 'DATA', field: 'requiere_envio', value: isAffirmative, valid: isAffirmative || isNegative };

        case 'direccion_entrega':
            return { type: 'DATA', field: 'direccion_entrega', value: sentenceCase(transcript), valid: transcript.length >= 3 };

        case 'modalidad_envio':
            if (transcript.includes('agencia') || transcript.includes('pagar') || transcript.includes('recojo')) {
                return { type: 'DATA', field: 'modalidad_envio', value: 'Por Pagar', valid: true };
            }
            if (transcript.includes('fijo') || transcript.includes('calculado')) {
                return { type: 'DATA', field: 'modalidad_envio', value: 'Fijo', valid: true };
            }
            return { type: 'DATA', field: 'modalidad_envio', value: '', valid: false };

        case 'forma_pago':
            const PAGO_METHODS = ['efectivo', 'yape', 'plin', 'transferencia'];
            const pMatch = PAGO_METHODS.find(m => transcript.includes(m));
            return { type: 'DATA', field: 'forma_pago', value: pMatch ? capitalize(pMatch) : 'Efectivo', valid: true };

        case 'comprobante_pago':
            const comprobante = transcript.replace(/operación|numero|número|op|#|no/g, '').trim();
            return { type: 'DATA', field: 'comprobante_pago', value: comprobante, valid: true };

        case 'incluye_igv':
            const includesIGV = /\bsi\b/i.test(transcript) || transcript.includes('incluye') || transcript.includes('con igv');
            const excludesIGV = /\bno\b/i.test(transcript) || transcript.includes('sin igv') || transcript.includes('no incluye');
            return { type: 'DATA', field: 'incluye_igv', value: includesIGV, valid: includesIGV || excludesIGV };

        case 'monto_a_cuenta':
            const vCuenta = extractNumber(transcript);
            return { type: 'DATA', field: 'monto_a_cuenta', value: vCuenta, valid: vCuenta >= 0 };

        case 'envio_cobrado_al_cliente':
            const vEnvio = extractNumber(transcript);
            return { type: 'DATA', field: 'envio_cobrado_al_cliente', value: vEnvio, valid: vEnvio >= 0 };

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

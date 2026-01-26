// src/voice/speechParser.js
import { VOCABULARY } from './vocabulary';

// Parser minimalista sin fuzzy matching
export function parseSpeech(text, campoEsperado) {
    const transcript = text.toLowerCase().trim();

    // Detectar comandos
    // Detectar comandos
    // DESACTIVADO: La confirmación es visual ahora
    /*
    if (VOCABULARY.confirmar.some(c => transcript.includes(c))) {
        return { type: 'COMMAND', value: 'CONFIRM' };
    }
    if (VOCABULARY.agregar.some(c => transcript.includes(c))) {
        return { type: 'COMMAND', value: 'ADD_PRODUCT' };
    }
    if (VOCABULARY.terminar.some(c => transcript.includes(c))) {
        return { type: 'COMMAND', value: 'FINISH' };
    }
    */

    // Parsear según campo esperado
    const NEGATIVOS = ['no', 'ninguno', 'sin registro', 'omitir', 'vacío', 'vacio', 'paso', 'nada'];

    switch (campoEsperado) {
        case 'nombre_cliente':
            // Tomar todo como nombre
            return {
                type: 'DATA',
                field: 'nombre_cliente',
                value: capitalize(transcript),
                // Nombre válido con 2 letras (ej: Al, Li, Bo)
                valid: transcript.length >= 2
            };

        case 'telefono':
            // Extraer solo números
            const phone = transcript.replace(/\D/g, '');
            return {
                type: 'DATA',
                field: 'telefono',
                value: phone,
                // Validación más flexible: entre 7 y 15 dígitos
                valid: phone.length >= 7 && phone.length <= 15
            };

        case 'ruc_dni':
            if (NEGATIVOS.some(n => transcript.includes(n))) {
                return {
                    type: 'DATA',
                    field: 'ruc_dni',
                    value: null,
                    valid: true
                };
            }
            // Intentar limpiar todo lo que no sea numero
            const doc = transcript.replace(/\D/g, '');
            return {
                type: 'DATA',
                field: 'ruc_dni',
                value: doc,
                valid: doc.length >= 8 // Minimo DNI
            };

        case 'producto':
            // SIMPLIFICADO: Solo capturar el texto literal del producto
            // Se desactiva el parseo "inteligente" para evitar errores

            /* LÓGICA ANTERIOR (COMPOUND)
            const cantidadMatch = extractNumber(transcript);
            const metales = ['plata', 'alpaca', 'cobre', 'bronce', 'oro'];
            const tipos = ['anillo', 'arete', 'collar', 'pulsera', 'dije', 'cadena'];

            const metalEncontrado = metales.find(m => transcript.includes(m));
            const tipoEncontrado = tipos.find(t => transcript.includes(t));

            if (tipoEncontrado || metalEncontrado) {
                return {
                    type: 'DATA',
                    field: 'producto_compuesto',
                    value: {
                        cantidad: cantidadMatch > 0 ? cantidadMatch : null,
                        tipo_producto: tipoEncontrado ? capitalize(tipoEncontrado) : null,
                        metal: metalEncontrado ? capitalize(metalEncontrado) : null,
                        original: transcript
                    },
                    valid: true
                };
            }
            */

            // Captura simple
            return {
                type: 'DATA',
                field: 'producto',
                value: capitalize(transcript),
                valid: transcript.length >= 2
            };

            // Si no, tomar literal como antes
            return {
                type: 'DATA',
                field: 'producto',
                value: capitalize(transcript),
                valid: transcript.length >= 2
            };
        case 'cantidad':
            const qty = extractNumber(transcript);
            return {
                type: 'DATA',
                field: 'cantidad',
                value: qty,
                valid: qty > 0 && qty <= 1000
            };

        case 'precio':
            // Intentar extraer número directo (ej: "120", "ciento veinte")
            const precioMatch = extractNumber(transcript);

            // Si encontramos un número, asumimos que es el precio
            if (precioMatch > 0) {
                return {
                    type: 'DATA',
                    field: 'precio',
                    value: precioMatch,
                    valid: true
                };
            }

            return { type: 'ERROR', message: 'No entendí el precio' };

        default:
            return { type: 'ERROR', message: 'Campo no reconocido' };
    }
}

// Utilidades simples
const NUMEROS_TEXTO = {
    'un': 1, 'uno': 1, 'una': 1,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
    'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
    'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'veinte': 20, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
    'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
    'cien': 100, 'ciento': 100, 'doscientos': 200, 'quinientos': 500, 'mil': 1000
};

function extractNumber(text) {
    // Intentar número dígito
    const match = text.match(/(\d+(?:\.\d+)?)/);
    if (match) return parseFloat(match[1]);

    // Intentar número texto
    const palabras = text.toLowerCase().split(' ');
    let valor = 0;

    for (const p of palabras) {
        if (NUMEROS_TEXTO[p]) valor += NUMEROS_TEXTO[p];
    }

    // Si encontramos algún número en texto, retornarlo
    if (valor > 0) return valor;

    return 0;
}

function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

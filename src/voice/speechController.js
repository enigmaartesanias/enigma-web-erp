// src/voice/speechController.js
import { parseSpeech } from './speechParser';

const FLUJO = [
    { campo: 'nombre_cliente', pregunta: 'Nombre del cliente' },
    { campo: 'telefono', pregunta: 'Número de teléfono' },
    { campo: 'dni_ruc', pregunta: 'Número de DNI o RUC, opcional. Puedes decir no' },
    // FASE 2: PRODUCTOS (NUEVO ORDEN)
    { campo: 'metal', pregunta: 'Material', bloque: 'PRODUCTO' },
    { campo: 'tipo_producto', pregunta: 'Producto', bloque: 'PRODUCTO' },
    { campo: 'descripcion_producto', pregunta: 'Detalles del producto', bloque: 'PRODUCTO' },
    { campo: 'cantidad', pregunta: 'Cantidad', bloque: 'PRODUCTO' },
    { campo: 'precio_unitario', pregunta: 'Precio unitario', bloque: 'PRODUCTO' }
];

export class VoiceController {
    constructor() {
        this.reset();
    }

    reset() {
        this.paso = 0;
        this.pedidoTemp = { nombre_cliente: '', telefono: '', dni_ruc: '', productos: [] };
        this.productoActual = { tipo_producto: '', metal: '', descripcion_producto: '', cantidad: '', precio_unitario: '' };
    }

    getPreguntaActual() {
        const actual = FLUJO[this.paso];
        if (!actual) return { pregunta: '¿Deseas ingresar otro producto?', campo: 'PREGUNTA_OTRO' };
        return actual;
    }

    syncWithForm(formData, productoActual, focusedField) {
        const mapeoDom = {
            'nombre_cliente': 0, 'telefono': 1, 'dni_ruc': 2,
            'metal': 3, 'tipo_producto': 4, 'nombre_producto': 5,
            'cantidad': 6, 'precio_unitario': 7
        };

        if (focusedField && mapeoDom[focusedField] !== undefined) {
            this.paso = mapeoDom[focusedField];
            this.pedidoTemp = { ...formData };
            this.productoActual = { ...productoActual, descripcion_producto: productoActual.nombre_producto };
            return;
        }

        for (let i = 0; i < FLUJO.length; i++) {
            const config = FLUJO[i];
            let valor = '';
            if (config.bloque === 'PRODUCTO') {
                const mapeoInterno = {
                    'metal': productoActual.metal,
                    'tipo_producto': productoActual.tipo_producto,
                    'descripcion_producto': productoActual.nombre_producto,
                    'cantidad': productoActual.cantidad,
                    'precio_unitario': productoActual.precio_unitario
                };
                valor = mapeoInterno[config.campo];
            } else {
                valor = formData[config.campo];
            }
            if (!valor || valor === '') {
                if (config.campo === 'dni_ruc' && !focusedField) continue;
                this.paso = i;
                return;
            }
        }
    }

    shouldListenNext() { return true; }

    async procesarRespuesta(text, speak) {
        let actual = this.getPreguntaActual();
        const transcript = text.toLowerCase().trim();

        if (!transcript || transcript === '') {
            if (actual.campo === 'dni_ruc') {
                this.paso++;
                speak('Omitiendo DNI. ' + this.getPreguntaActual().pregunta);
                return { accion: 'SIGUIENTE' };
            }
            speak('No escuché bien. Repite ' + actual.pregunta);
            return { accion: 'REPETIR' };
        }

        if (actual.campo === 'PREGUNTA_OTRO') {
            const afirmativo = ['si', 'sí', 'claro', 'agregar', 'otro', 'dale', 'ya', 'por supuesto'];
            if (afirmativo.some(palabra => transcript.includes(palabra))) {
                this.paso = 3; // Reset al campo 'Material' (Metal)
                this.productoActual = { tipo_producto: '', metal: '', descripcion_producto: '', cantidad: '', precio_unitario: '' };
                speak('Material');
                return { accion: 'NUEVO_PRODUCTO' };
            } else {
                speak('Finalizando registro.');
                return { accion: 'FIN_FASE_2' };
            }
        }

        try {
            const resultado = parseSpeech(text, actual.campo);

            // VALIDACIÓN OBLIGATORIA (Ahora incluye descripción)
            const esObligatorio = ['nombre_cliente', 'telefono', 'tipo_producto', 'metal', 'descripcion_producto', 'cantidad', 'precio_unitario'].includes(actual.campo);

            if (!resultado.valid || (esObligatorio && (!resultado.value || resultado.value === ''))) {
                speak('Dato necesario. Repite ' + actual.pregunta);
                return { accion: 'REPETIR' };
            }

            if (actual.bloque === 'PRODUCTO') {
                this.productoActual[actual.campo] = resultado.value;
                this.paso++;
                if (actual.campo === 'precio_unitario') {
                    speak('Producto ingresado');
                    this.paso = FLUJO.length;
                    setTimeout(() => speak('¿Deseas ingresar otro producto?'), 1500);
                    return { accion: 'PRODUCTO_COMPLETO', producto: { ...this.productoActual } };
                }
            } else {
                this.pedidoTemp[resultado.field] = resultado.value;
                this.paso++;
            }

            const siguiente = this.getPreguntaActual();
            if (siguiente && siguiente.campo !== 'PREGUNTA_OTRO') speak(siguiente.pregunta);
            return { accion: 'SIGUIENTE' };
        } catch (error) {
            speak('Error. Repite ' + actual.pregunta);
            return { accion: 'ERROR' };
        }
    }
}

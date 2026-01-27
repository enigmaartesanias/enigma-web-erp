// src/voice/speechController.js
import { parseSpeech } from './speechParser';

const FLUJO = [
    { campo: 'nombre_cliente', pregunta: 'Nombre del cliente' },
    { campo: 'telefono', pregunta: 'Número de teléfono' },
    { campo: 'dni_ruc', pregunta: 'DNI o RUC (opcional)' },
    // FASE 2: PRODUCTOS
    { campo: 'metal', pregunta: 'Material: ¿Plata, Alpaca, Cobre o Bronce?', bloque: 'PRODUCTO' },
    { campo: 'tipo_producto', pregunta: 'Producto: ¿Anillo, Arete, Collar o Pulsera?', bloque: 'PRODUCTO' },
    { campo: 'nombre_producto', pregunta: 'Detalles del producto', bloque: 'PRODUCTO' },
    { campo: 'cantidad', pregunta: 'Cantidad', bloque: 'PRODUCTO' },
    { campo: 'precio_unitario', pregunta: 'Precio unitario', bloque: 'PRODUCTO' },
    // FASE 3: ENVIO
    { campo: 'requiere_envio', pregunta: '¿Requiere envío?' },
    { campo: 'direccion_entrega', pregunta: 'Dirección de entrega', bloque: 'ENVIO' },
    { campo: 'modalidad_envio', pregunta: 'Modalidad de envío', bloque: 'ENVIO' },
    { campo: 'envio_cobrado_al_cliente', pregunta: 'Costo de envío', bloque: 'ENVIO' },
    // FASE 4: PAGO
    { campo: 'forma_pago', pregunta: 'Forma de pago del adelanto: ¿Efectivo, Yape, Plin o Transferencia?', bloque: 'PAGO' },
    { campo: 'monto_a_cuenta', pregunta: 'Monto del adelanto o pago total', bloque: 'PAGO' }
];

export class VoiceController {
    constructor() { this.reset(); }
    reset() {
        this.paso = 0;
        this.pedidoTemp = {
            nombre_cliente: '', telefono: '', dni_ruc: '',
            requiere_envio: false, direccion_entrega: '', modalidad_envio: 'Fijo', envio_cobrado_al_cliente: 0,
            forma_pago: 'Efectivo', comprobante_pago: '', incluye_igv: false, monto_a_cuenta: 0
        };
        this.productoActual = { tipo_producto: '', metal: '', nombre_producto: '', cantidad: '', precio_unitario: '' };
    }

    shouldListenNext() {
        const actual = this.getPreguntaActual();
        return actual.campo !== 'FIN_TODO';
    }

    syncWithForm(formData, productoActual, focusedField) {
        const mapeoDom = {
            'nombre_cliente': 0, 'telefono': 1, 'dni_ruc': 2,
            'metal': 3, 'tipo_producto': 4, 'nombre_producto': 5, 'cantidad': 6, 'precio_unitario': 7,
            'requiere_envio': 8, 'direccion_entrega': 9, 'modalidad_envio': 10, 'envio_cobrado_al_cliente': 11,
            'forma_pago': 12, 'monto_a_cuenta': 13
        };

        // Siempre sincronizar datos para no perder lo que ya está en el formulario
        this.pedidoTemp = { ...this.pedidoTemp, ...formData };
        this.productoActual = {
            ...this.productoActual,
            ...productoActual
        };

        if (focusedField && mapeoDom[focusedField] !== undefined) {
            this.paso = mapeoDom[focusedField];
        }
    }

    async procesarRespuesta(text, speak) {
        let actual = this.getPreguntaActual();
        const transcript = text.toLowerCase().trim();

        // Manejo de SILENCIO / TIMEOUT
        if (!transcript || transcript === '') {
            const omitibles = ['dni_ruc', 'comprobante_pago', 'nombre_producto'];
            if (omitibles.includes(actual.campo)) {
                // Omitibles
                this.pedidoTemp[actual.campo] = '';
                this.paso++;
                const siguiente = this.getPreguntaActual();
                speak((actual.campo === 'dni_ruc' ? 'Omitido. ' : 'Sin detalles. ') + (siguiente ? siguiente.pregunta : ''));
                return { accion: 'SIGUIENTE' };
            }
            // Obligatorios
            speak(actual.pregunta + ' es obligatorio. Por favor dímelo.');
            return { accion: 'REPETIR' };
        }

        // Manejo de Comandos de Cierre Globales
        const lowerTranscript = transcript.toLowerCase();
        const comandosCierre = ['listo', 'terminé', 'terminé.', 'fin', 'eso es todo', 'así está bien', 'terminar'];

        if (comandosCierre.some(c => lowerTranscript.includes(c))) {
            if (actual.bloque === 'PRODUCTO') {
                // INTELIGENCIA: Primero intentamos procesar el campo actual con el texto (sin los comandos de cierre)
                const textWithoutComandos = text.replace(/listo|terminé|fin|eso es todo|así está bien|terminar/gi, '').trim();
                const parseActual = parseSpeech(textWithoutComandos || text, actual.campo);

                if (parseActual.valid) {
                    this.productoActual[actual.campo] = parseActual.value;
                }

                // Luego intentamos capturar lo que falte (Guess Intelligence)
                const numerosEnTexto = (text.match(/\d+/g) || []).map(Number);

                // Si estamos en nombre_producto y hay números, probablemente sean cantidad/precio
                if (actual.campo === 'nombre_producto') {
                    if (numerosEnTexto.length >= 1) this.productoActual.cantidad = numerosEnTexto[0];
                    if (numerosEnTexto.length >= 2) this.productoActual.precio_unitario = numerosEnTexto[1];
                }
                // Si estamos en cantidad y hay otro número después, es el precio
                else if (actual.campo === 'cantidad' && numerosEnTexto.length >= 2) {
                    this.productoActual.precio_unitario = numerosEnTexto[1];
                }

                // Validaciones finales antes de cerrar producto
                if (!this.productoActual.cantidad || this.productoActual.cantidad <= 0) this.productoActual.cantidad = 1;

                this.paso = -1; // Pregunta "¿Otro?"
                speak('Producto procesado. ¿Deseas ingresar otro producto?');
                return { accion: 'PRODUCTO_COMPLETO', producto: { ...this.productoActual } };
            }
            speak('Entendido. Finalizando registro por voz.');
            return { accion: 'FIN_VOZ_TOTAL', data: { ...this.pedidoTemp } };
        }

        // Manejo "¿Deseas otro producto?"
        if (actual.campo === 'PREGUNTA_OTRO') {
            const afirmativo = ['si', 'sí', 'claro', 'agregar', 'otro', 'dale', 'ya', 'bueno'];
            const negativo = ['no', 'terminar', 'fin', 'nada', 'siguiente', 'envio', 'envío'];
            if (afirmativo.some(p => transcript.includes(p))) {
                this.paso = 3; // Regresa a Material
                this.productoActual = { tipo_producto: '', metal: '', nombre_producto: '', cantidad: '', precio_unitario: '' };
                speak('Genial. Nuevo producto. ¿Material?');
                return { accion: 'NUEVO_PRODUCTO' };
            } else if (negativo.some(p => transcript.includes(p))) {
                this.paso = 8; // Salta a ¿Requiere envío?
                const sig = this.getPreguntaActual();
                speak('Entendido. ' + sig.pregunta);
                return { accion: 'IR_A_ENVIO' };
            } else {
                speak('Continúa cuando desees. ¿Deseas ingresar otro producto? Sí o No.');
                return { accion: 'REPETIR' };
            }
        }

        try {
            const resultado = parseSpeech(text, actual.campo);

            // Validaciones básicas de campos obligatorios e Inteligencia de Omisión
            const omitibles = ['dni_ruc', 'comprobante_pago', 'nombre_producto'];
            const negativo = ['no', 'sin', 'ninguno', 'omitir', 'paso', 'nada', 'continuar'];

            if (omitibles.includes(actual.campo) && negativo.some(n => transcript.includes(n))) {
                this.pedidoTemp[actual.campo] = '';
                this.paso++;
                const sig = this.getPreguntaActual();
                speak('Entendido. ' + sig.pregunta);
                return { accion: 'SIGUIENTE' };
            }

            if (!resultado.valid && !omitibles.includes(actual.campo)) {
                speak('Te escucho. Por favor repite ' + actual.pregunta);
                return { accion: 'REPETIR' };
            }

            // Lógica específica Fase 3 (Envío)
            if (actual.campo === 'requiere_envio') {
                this.pedidoTemp.requiere_envio = resultado.value;
                if (!resultado.value) {
                    this.paso = 12; // Saltar a Fase 4 (forma_pago)
                    const sig = this.getPreguntaActual();
                    speak('Perfecto. ' + sig.pregunta);
                    return { accion: 'SIGUIENTE' };
                }
                this.paso += 2; // Saltar dirección de entrega, ir directo a modalidad
                speak('Bien. ¿Modalidad: Envío fijo o por pagar en agencia?');
                return { accion: 'SIGUIENTE' };
            }

            if (actual.campo === 'direccion_entrega') {
                if (!resultado.valid) {
                    speak('Dime la dirección para continuar.');
                    return { accion: 'REPETIR' };
                }
                this.pedidoTemp.direccion_entrega = resultado.value;
                this.paso++;
                speak('Modalidad: ¿Envío fijo o por pagar en agencia?');
                return { accion: 'SIGUIENTE' };
            }

            if (actual.campo === 'modalidad_envio') {
                if (!resultado.valid) {
                    speak('¿Envío fijo o por pagar en agencia?');
                    return { accion: 'REPETIR' };
                }
                this.pedidoTemp.modalidad_envio = resultado.value;

                if (resultado.value === 'Por Pagar') {
                    this.pedidoTemp.envio_cobrado_al_cliente = 0;
                    this.paso = 12; // Pasar a Fase 4 (forma_pago)
                    const sig = this.getPreguntaActual();
                    speak('Bien. ' + sig.pregunta);
                    return { accion: 'SIGUIENTE' };
                }

                this.paso++;
                speak('¿Cuál es el costo de envío?');
                return { accion: 'SIGUIENTE' };
            }

            if (actual.campo === 'envio_cobrado_al_cliente') {
                if (resultado.value <= 0 && this.pedidoTemp.modalidad_envio === 'Fijo') {
                    speak('El costo es necesario para envío fijo. ¿Cuánto es?');
                    return { accion: 'REPETIR' };
                }
                this.pedidoTemp.envio_cobrado_al_cliente = resultado.value;
                this.paso++; // Ir a forma_pago
                const sig = this.getPreguntaActual();
                speak('Registrado. ' + sig.pregunta);
                return { accion: 'SIGUIENTE' };
            }

            // Lógica general bloques
            if (actual.bloque === 'PRODUCTO') {
                this.productoActual[actual.campo] = resultado.value;
                this.paso++;
                if (actual.campo === 'precio_unitario') {
                    this.paso = -1; // Pregunta "¿Otro?"
                    speak('Producto añadido. ¿Deseas ingresar otro producto?');
                    return { accion: 'PRODUCTO_COMPLETO', producto: { ...this.productoActual } };
                }
            } else {
                this.pedidoTemp[actual.campo] = resultado.value;
                this.paso++;

                // Transición especial al cerrar Fase 1
                if (actual.campo === 'dni_ruc') {
                    const siguiente = this.getPreguntaActual();
                    speak('Datos del cliente listos. ' + (siguiente ? siguiente.pregunta : ''));
                    return { accion: 'SIGUIENTE' };
                }

                // Finalización del flujo total
                if (this.paso >= FLUJO.length) {
                    const dataFinal = { ...this.pedidoTemp };
                    speak('Todo listo. Registro de pedidos completado.');
                    return { accion: 'FIN_VOZ_TOTAL', data: dataFinal };
                }
            }

            const siguiente = this.getPreguntaActual();
            if (siguiente && siguiente.campo !== 'FIN_TODO') {
                speak(siguiente.pregunta);
            }
            return { accion: 'SIGUIENTE' };

        } catch (error) {
            speak('Te escucho. Continúa con ' + actual.pregunta);
            return { accion: 'ERROR' };
        }
    }

    getPreguntaActual() {
        if (this.paso === -1) return { campo: 'PREGUNTA_OTRO', pregunta: '¿Deseas ingresar otro producto?' };
        const actual = FLUJO[this.paso];
        if (!actual) return { pregunta: 'Proceso terminado', campo: 'FIN_TODO' };
        return actual;
    }
}

// src/voice/speechController.js
import { parseSpeech } from './speechParser';

const FLUJO = [
    { campo: 'nombre_cliente', pregunta: 'Nombre del cliente' },
    { campo: 'telefono', pregunta: 'Número de teléfono' },
    { campo: 'dni_ruc', pregunta: 'DNI o RUC (opcional)' },
    // FASE 2: PRODUCTOS
    { campo: 'metal', pregunta: 'Material', bloque: 'PRODUCTO' },
    { campo: 'tipo_producto', pregunta: 'Producto', bloque: 'PRODUCTO' },
    { campo: 'descripcion_producto', pregunta: 'Detalles del producto', bloque: 'PRODUCTO' },
    { campo: 'cantidad', pregunta: 'Cantidad', bloque: 'PRODUCTO' },
    { campo: 'precio_unitario', pregunta: 'Precio unitario', bloque: 'PRODUCTO' },
    // FASE 3: ENVIO
    { campo: 'requiere_envio', pregunta: '¿Requiere envío?' },
    { campo: 'direccion_entrega', pregunta: 'Dirección de entrega', bloque: 'ENVIO' },
    { campo: 'modalidad_envio', pregunta: 'Modalidad de envío', bloque: 'ENVIO' },
    { campo: 'envio_cobrado_al_cliente', pregunta: 'Costo de envío', bloque: 'ENVIO' }
];

export class VoiceController {
    constructor() { this.reset(); }
    reset() {
        this.paso = 0;
        this.pedidoTemp = {
            nombre_cliente: '', telefono: '', dni_ruc: '',
            requiere_envio: false, direccion_entrega: '', modalidad_envio: 'Fijo', envio_cobrado_al_cliente: 0
        };
        this.productoActual = { tipo_producto: '', metal: '', descripcion_producto: '', cantidad: '', precio_unitario: '' };
    }

    shouldListenNext() {
        const actual = this.getPreguntaActual();
        return actual.campo !== 'FIN_TODO';
    }

    syncWithForm(formData, productoActual, focusedField) {
        const mapeoDom = {
            'nombre_cliente': 0, 'telefono': 1, 'dni_ruc': 2,
            'metal': 3, 'tipo_producto': 4, 'nombre_producto': 5, 'cantidad': 6, 'precio_unitario': 7,
            'requiere_envio': 8, 'direccion_entrega': 9, 'modalidad_envio': 10, 'envio_cobrado_al_cliente': 11
        };
        if (focusedField && mapeoDom[focusedField] !== undefined) {
            this.paso = mapeoDom[focusedField];
            this.pedidoTemp = { ...this.pedidoTemp, ...formData };
            this.productoActual = { ...productoActual, descripcion_producto: productoActual.nombre_producto };
            return;
        }
    }

    async procesarRespuesta(text, speak) {
        let actual = this.getPreguntaActual();
        const transcript = text.toLowerCase().trim();

        // Manejo de SILENCIO / TIMEOUT
        if (!transcript || transcript === '') {
            // Especial para DNI/RUC: silencio = vacío y pasar al siguiente
            if (actual.campo === 'dni_ruc') {
                this.pedidoTemp.dni_ruc = '';
                this.paso++;
                const siguiente = this.getPreguntaActual();
                speak('Datos personales ingresados. ' + (siguiente ? siguiente.pregunta : ''));
                return { accion: 'SIGUIENTE' };
            }
            speak('No escuché. ' + actual.pregunta);
            return { accion: 'REPETIR' };
        }

        // Manejo "¿Deseas otro producto?"
        if (actual.campo === 'PREGUNTA_OTRO') {
            const afirmativo = ['si', 'sí', 'claro', 'agregar', 'otro', 'dale'];
            if (afirmativo.some(p => transcript.includes(p))) {
                this.paso = 3; // Regresa a Material
                this.productoActual = { tipo_producto: '', metal: '', descripcion_producto: '', cantidad: '', precio_unitario: '' };
                speak('Material');
                return { accion: 'NUEVO_PRODUCTO' };
            } else {
                this.paso = 9; // Salta a ¿Requiere envío?
                const sig = this.getPreguntaActual();
                speak('Entendido. ' + sig.pregunta);
                return { accion: 'IR_A_ENVIO' };
            }
        }

        try {
            const resultado = parseSpeech(text, actual.campo);

            // Validaciones básicas (sin repetir el valor)
            if (!resultado.valid && actual.campo !== 'dni_ruc') {
                speak('Valor no válido para ' + actual.pregunta + '. Repite.');
                return { accion: 'REPETIR' };
            }

            // Lógica específica Fase 3 (Envío)
            if (actual.campo === 'requiere_envio') {
                this.pedidoTemp.requiere_envio = resultado.value;
                if (!resultado.value) {
                    this.paso = FLUJO.length; // Fin
                    speak('Sin envío. Pedido registrado.');
                    return { accion: 'FIN_FASE_3' };
                }
                this.paso++;
                speak('Dirección de entrega');
                return { accion: 'SIGUIENTE' };
            }

            if (actual.campo === 'modalidad_envio') {
                this.pedidoTemp.modalidad_envio = resultado.value;
                if (resultado.value.includes('Agencia')) {
                    this.pedidoTemp.envio_cobrado_al_cliente = 0;
                    this.paso = FLUJO.length;
                    speak('Pago en agencia. Pedido registrado.');
                    return { accion: 'FIN_FASE_3' };
                }
                this.paso++;
                speak('Costo de envío');
                return { accion: 'SIGUIENTE' };
            }

            if (actual.campo === 'envio_cobrado_al_cliente') {
                this.pedidoTemp.envio_cobrado_al_cliente = resultado.value;
                this.paso = FLUJO.length;
                speak('Costo registrado. Pedido registrado.');
                return { accion: 'FIN_FASE_3' };
            }

            // Lógica general bloques
            if (actual.bloque === 'PRODUCTO') {
                this.productoActual[actual.campo] = resultado.value;
                this.paso++;
                if (actual.campo === 'precio_unitario') {
                    this.paso = -1; // Pregunta "¿Otro?"
                    speak('Producto listo. ¿Deseas ingresar otro producto?');
                    return { accion: 'PRODUCTO_COMPLETO', producto: { ...this.productoActual } };
                }
            } else {
                this.pedidoTemp[actual.campo] = resultado.value;
                this.paso++;

                // Transición especial al cerrar Fase 1
                if (actual.campo === 'dni_ruc') {
                    const siguiente = this.getPreguntaActual();
                    speak('Datos personales ingresados. ' + (siguiente ? siguiente.pregunta : ''));
                    return { accion: 'SIGUIENTE' };
                }
            }

            const siguiente = this.getPreguntaActual();
            if (siguiente && siguiente.campo !== 'FIN_TODO') {
                speak(siguiente.pregunta);
            }
            return { accion: 'SIGUIENTE' };

        } catch (error) {
            speak('Error procesando respuesta. Repite ' + actual.pregunta);
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

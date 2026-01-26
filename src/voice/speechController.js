// src/voice/speechController.js
import { parseSpeech } from './speechParser';

const FLUJO = [
    { campo: 'nombre_cliente', pregunta: '¿Nombre del cliente?' },
    { campo: 'telefono', pregunta: '¿Teléfono?' },
    { campo: 'ruc_dni', pregunta: 'RUC o DNI, puedes decir no' }, // Nuevo campo
    // Inicio de bloque de productos
    { campo: 'producto', pregunta: '¿Qué producto? (Ej: Dos anillos de plata)', bloque: 'PRODUCTO' },
    { campo: 'cantidad', pregunta: '¿Cuántas unidades?', bloque: 'PRODUCTO' },
    // Agregamos campo Metal explícito por si no lo dice en la frase compuesta
    { campo: 'metal', pregunta: '¿De qué material? (Plata, Alpaca, Cobre)', bloque: 'PRODUCTO' },
    { campo: 'precio', pregunta: '¿Precio por unidad?', bloque: 'PRODUCTO' }
];

export class VoiceController {
    constructor() {
        this.reset();
    }

    reset() {
        this.paso = 0;
        this.pedidoTemp = {
            nombre_cliente: '',
            telefono: '',
            ruc_dni: null,
            productos: []
        };
        this.productoTemp = {};
    }

    getPreguntaActual() {
        // Verificar si ya tenemos el dato (por frase compuesta) para saltar pregunta
        let actual = FLUJO[this.paso];

        // Si ya estamos fuera del rango
        if (!actual) {
            return { pregunta: '¿Agregar otro producto?', campo: 'CONFIRMAR_PRODUCTO' };
        }

        // Saltar preguntas si el dato ya existe (llenado por frase compuesta)
        // Solo para bloque PRODUCTO
        while (actual && actual.bloque === 'PRODUCTO' && this.productoTemp[actual.campo]) {
            this.paso++;
            actual = FLUJO[this.paso];
            if (!actual) return { pregunta: '¿Agregar otro producto?', campo: 'CONFIRMAR_PRODUCTO' };
        }

        return actual;
    }

    shouldListenNext() {
        const actual = this.getPreguntaActual();
        if (!actual) return false;

        // SOLO voz para datos simples (Nombre, Teléfono, RUC)
        // Evitamos que el mic se prenda para productos
        return ['nombre_cliente', 'telefono', 'ruc_dni'].includes(actual.campo);
    }

    async procesarRespuesta(text, speak) {
        const actual = this.getPreguntaActual();

        try {
            // Parsear respuesta
            const resultado = parseSpeech(text, actual.campo);

            // Manejar comandos
            if (resultado.type === 'COMMAND') {
                return this.handleCommand(resultado.value, speak);
            }

            // Validar dato
            if (resultado.type === 'ERROR' || !resultado.valid || (resultado.value === undefined)) {
                speak('No entendí el valor. Repite por favor.');
                return { accion: 'REPETIR' };
            }

            // Guardar dato
            if (actual.bloque === 'PRODUCTO') {
                // Manejo simplificado para productos (solo cantidad y campos simples si se reactiva, pero por defecto estará manual)
                // Si el parser detecta compuesto, lo usamos, pero la idea es simplificar
                if (resultado.field === 'producto_compuesto') {
                    // Logica existente... (se mantendrá, pero el parser quizás ya no lo devuelva si lo deshabilitamos)
                    // Por si acaso, mantenemos compatibilidad por si se decide usar
                    const { cantidad, tipo_producto, metal } = resultado.value;

                    if (tipo_producto) this.productoTemp.producto = tipo_producto;
                    if (metal) this.productoTemp.metal = metal;
                    if (cantidad) this.productoTemp.cantidad = cantidad;

                    let mensaje = 'Registrado: ';
                    if (tipo_producto) mensaje += tipo_producto;
                    speak(mensaje);

                    this.paso++;
                    // NO hablamos la siguiente pregunta aqui, el control de mic lo hará useVoiceOrder
                    return { accion: 'SIGUIENTE' };

                } else {
                    let field = resultado.field;
                    if (actual.campo === 'metal' && field === 'producto') field = 'metal';

                    this.productoTemp[actual.campo] = resultado.value;
                    // speak(`${resultado.value} registrado`); // SILENCIO
                    this.paso++;
                }
            } else {
                this.pedidoTemp[resultado.field] = resultado.value;
                // speak(`${resultado.value} registrado`); // SILENCIO

                // CAMBIO CLAVE: Avance rápido en fase 1
                this.paso++;

                // CIERRE DE FASE 1
                if (actual.campo === 'ruc_dni') {
                    speak('Datos personales registrados');
                    return { accion: 'FIN_FASE_1' };
                }
            }


            // Si terminamos un bloque de producto
            if (this.paso >= FLUJO.length) {
                this.guardarProducto();
                speak('Producto guardado. ¿Agregar otro?');
                return { accion: 'CONFIRMAR_PRODUCTO' };
            }

            // Siguiente pregunta
            // Solo si NO hemos retornado antes
            const siguiente = this.getPreguntaActual();
            if (siguiente && this.shouldListenNext()) {
                speak(siguiente.pregunta);
            }
            return { accion: 'SIGUIENTE' };

        } catch (error) {
            console.error('Error en procesarRespuesta:', error);
            speak('Error. Repite por favor.');
            return { accion: 'ERROR' };
        }
    }

    handleCommand(command, speak) {
        if (command === 'ADD_PRODUCT') {
            // Reiniciar bloque de producto
            this.productoTemp = {};
            // Buscar índice donde empieza producto
            this.paso = FLUJO.findIndex(f => f.campo === 'producto');
            speak('Nuevo producto. ¿Qué producto?');
            return { accion: 'NUEVO_PRODUCTO' };
        }

        if (command === 'FINISH') {
            return this.confirmarPedido(speak);
        }

        if (command === 'CONFIRM') {
            return { accion: 'CONFIRMADO', pedido: this.pedidoTemp };
        }

        return { accion: 'COMANDO_DESCONOCIDO' };
    }

    guardarProducto() {
        if (Object.keys(this.productoTemp).length > 0) {
            this.pedidoTemp.productos.push({
                nombre: this.productoTemp.producto || '', // Esto es el TIPO (Anillo)
                cantidad: this.productoTemp.cantidad || 1,
                precio: this.productoTemp.precio || 0,
                metal: this.productoTemp.metal || '',
                producto: this.productoTemp.producto // Redundancia útil
            });
            console.log('📦 Producto guardado temp:', this.productoTemp);
            this.productoTemp = {};
        }
    }

    confirmarPedido(speak) {
        // Asegurar guardar el último producto si quedó pendiente
        if (Object.keys(this.productoTemp).length > 0 && this.productoTemp.producto) {
            this.guardarProducto();
        }

        const total = this.pedidoTemp.productos.reduce((sum, p) =>
            sum + (p.cantidad * p.precio), 0
        );

        const resumen = `Pedido para ${this.pedidoTemp.nombre_cliente}, ` +
            `${this.pedidoTemp.productos.length} productos, ` +
            `total ${total} soles. ¿Confirmar?`;

        speak(resumen);
        return { accion: 'ESPERAR_CONFIRMACION_FINAL' };
    }
}

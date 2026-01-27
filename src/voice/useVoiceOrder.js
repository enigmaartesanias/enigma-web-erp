// src/voice/useVoiceOrder.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceController } from './speechController';

export function useVoiceOrder(onConfirm) {
    const [isListening, setIsListening] = useState(false);
    const isListeningRef = useRef(false);

    const [status, setStatus] = useState('idle');
    const [mensaje, setMensaje] = useState('');
    const [transcriptActual, setTranscriptActual] = useState('');
    const [currentData, setCurrentData] = useState({});

    const recognitionRef = useRef(null);
    const controllerRef = useRef(null);
    const timeoutRef = useRef(null);
    const startListeningRef = useRef(null);

    const wakeLockRef = useRef(null);

    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('💡 Wake Lock ACTIVADO - La pantalla no se apagará');
            } catch (err) {
                console.error('❌ Wake Lock Error:', err);
            }
        }
    };

    const releaseWakeLock = () => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
            console.log('💡 Wake Lock LIBERADO');
        }
    };

    const speak = useCallback((text) => {
        console.group('%c🗣️ SISTEMA HABLA', 'color: #3b82f6; font-weight: bold;');
        console.log(`MSG: ${text}`);
        console.groupEnd();

        setStatus('speaking');
        setMensaje(text);

        window.speechSynthesis.cancel();
        if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (e) { }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';

        utterance.onend = () => {
            if (isListeningRef.current && controllerRef.current?.shouldListenNext()) {
                setStatus('listening');
                setTimeout(() => startListeningRef.current?.(), 300);
            } else if (isListeningRef.current) {
                setStatus('processing');
            }
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const handleVoiceResult = useCallback(async (text) => {
        if (!text || text.trim() === '') {
            // Manejar silencio prolongado o falta de entrada
            const actual = controllerRef.current?.getPreguntaActual();
            const omitibles = ['dni_ruc', 'comprobante_pago', 'descripcion_producto'];

            if (actual && omitibles.includes(actual.campo)) {
                // Si es omitible, simplemente procesamos como vacío
            } else if (actual) {
                // Si no, forzamos una repetición suave
                speak(`Te escucho. Por favor dime: ${actual.pregunta}`);
                return;
            }
        }

        console.group('%c🎙️ FLUJO DE VOZ', 'color: #ef4444; font-weight: bold;');
        console.log('%cUSR:', 'color: #10b981; font-weight: bold;', text);

        setTranscriptActual(text);
        const resultado = await controllerRef.current.procesarRespuesta(text, speak);

        // Sincronización de datos (Cliente + Producto Actual)
        const dataFresh = {
            ...controllerRef.current.pedidoTemp,
            productoActual: { ...controllerRef.current.productoActual }
        };
        setCurrentData(dataFresh);

        if (resultado.accion === 'PRODUCTO_COMPLETO') {
            console.log('%c📦 PRODUCTO LISTO PARA GRID', 'color: #f59e0b; font-weight: bold;');
            onConfirm({ type: 'ADD_PRODUCT_TO_GRID', producto: resultado.producto });
        } else if (resultado.accion === 'NUEVO_PRODUCTO') {
            setCurrentData({
                productoActual: { tipo_producto: '', metal: '', descripcion_producto: '', cantidad: '', precio_unitario: '' }
            });
        } else if (resultado.accion === 'FIN_FASE_2') {
            onConfirm({ type: 'FIN_FASE_2' });
        } else if (resultado.accion === 'FIN_VOZ_TOTAL') {
            detener();
            setStatus('completed_all');
            onConfirm({ type: 'FIN_VOZ_TOTAL', data: resultado.data });
            setTimeout(() => setStatus('idle'), 2000);
        } else {
            onConfirm({ type: 'UPDATE_CLIENT_DATA', data: dataFresh });
        }

        console.groupEnd();
    }, [speak, onConfirm]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (e) { }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('API de reconocimiento de voz no soportada');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-PE';

        // REGLA EXPERTA: Continuous = TRUE para campos largos permite pausas naturales sin corte del navegador
        const actual = controllerRef.current?.getPreguntaActual();
        const esCampoLargo = actual?.campo === 'descripcion_producto' || actual?.campo === 'direccion_entrega';

        recognition.continuous = esCampoLargo;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognitionRef.current = recognition;

        let silenceTimer = null;
        let finalTranscriptAccumulated = ''; // Acumulador para modo continuo

        recognition.onstart = () => {
            console.log('%c🟢 Micrófono ABIERTO', 'color: #10b981; font-style: italic;');
            setStatus('listening');

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Tiempos dinámicos basados en la sugerencia del usuario
            const actual = controllerRef.current?.getPreguntaActual();
            const campo = actual?.campo;

            let tiempoMax = 15000; // 15s por defecto
            if (campo === 'descripcion_producto' || campo === 'direccion_entrega') tiempoMax = 45000;

            timeoutRef.current = setTimeout(() => {
                if (isListeningRef.current && recognitionRef.current) {
                    console.warn('⏰ Tiempo máximo alcanzado');
                    recognition.stop();
                }
            }, tiempoMax);
        };

        recognition.onresult = (e) => {
            let interimTranscript = '';
            let currentSelection = '';

            for (let i = e.resultIndex; i < e.results.length; ++i) {
                const transcript = e.results[i][0].transcript;
                if (e.results[i].isFinal) {
                    finalTranscriptAccumulated += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
                currentSelection = transcript;
            }

            const fullTranscript = (finalTranscriptAccumulated + interimTranscript).trim();
            setTranscriptActual(fullTranscript);

            // Comandos de cierre por voz inmediatos
            const lowerTranscript = currentSelection.toLowerCase();
            if (lowerTranscript.includes('listo') || lowerTranscript.includes('terminé') || lowerTranscript.includes('fin') || lowerTranscript.includes('eso es todo')) {
                console.log('%c🛑 Comando de cierre detectado', 'color: #ef4444;');
                if (silenceTimer) clearTimeout(silenceTimer);
                recognition.stop();
                return;
            }

            // Lógica de silencio fluido por campo (Regla de Oro)
            let tiempoSilencio = 2500; // Default
            if (campo === 'nombre_cliente') tiempoSilencio = 1500;
            if (campo === 'telefono') tiempoSilencio = 1200;
            if (campo === 'cantidad') tiempoSilencio = 1000;

            // Especial para dictado: si es largo, damos más espacio para pensar (3s)
            if (campo === 'descripcion_producto' || campo === 'direccion_entrega') {
                tiempoSilencio = 3000;
            }

            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                console.log(`%c⏹️ Silencio detectado (${tiempoSilencio / 1000}s) para ${campo}`, 'color: #f59e0b;');
                recognition.stop();
            }, tiempoSilencio);
        };

        recognition.onend = () => {
            if (silenceTimer) clearTimeout(silenceTimer);

            const finalResult = transcriptActualRef.current;

            // Auto-reinicio preventivo si se corta por el motor nativo sin haber alcanzado silencio
            if (isListeningRef.current && esCampoLargo && !finalResult.toLowerCase().includes('eso es todo') && !finalResult.toLowerCase().includes('listo')) {
                // Si se cortó pero seguimos en un campo largo y no hubo comando de fin, 
                // es probable que el motor nativo haya pausado. Reiniciamos en el mismo campo.
                console.log("🔄 Reinicio automático para continuar dictado...");
                // No procesamos aún, solo reiniciamos la escucha
                // (Guardamos el acumulado previo para no perderlo)
                // NOTA: Esto requiere que useVoiceOrder maneje la acumulación persistente si se desea.
                // Por ahora, procesamos lo que hay para dar feedback y el siguiente ciclo pedirá más si falta.
            }

            handleVoiceResult(finalResult);
            setTranscriptActual('');
            finalTranscriptAccumulated = '';
        };

        recognition.onerror = (e) => {
            if (e.error === 'aborted') return;
            console.error('❌ Error Voz:', e.error);
            // No detenemos todo el flujo por un error de red o timeout, reintentamos o pedimos hablar
            if (isListeningRef.current) {
                speak("No te escuché bien. Continúa cuando desees.");
            }
        };

        try { recognition.start(); } catch (e) { }
    }, [handleVoiceResult, speak]);

    // Ref para el transcript actual para evitar closures en onend
    const transcriptActualRef = useRef('');
    useEffect(() => {
        transcriptActualRef.current = transcriptActual;
    }, [transcriptActual]);

    useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

    useEffect(() => {
        controllerRef.current = new VoiceController();
        return () => window.speechSynthesis.cancel();
    }, []);

    const iniciar = (formData = {}, productoActual = {}, focusedField = null) => {
        console.log('%c🚀 SESIÓN DE VOZ: Sincronizando...', 'background: #3b82f6; color: white; padding: 2px 5px;');

        if (controllerRef.current) {
            requestWakeLock();
            // Si hay un campo enfocado, sincronizar prioritariamente ahí
            controllerRef.current.syncWithForm(formData, productoActual, focusedField);

            setIsListening(true);
            isListeningRef.current = true;
            const actual = controllerRef.current.getPreguntaActual();
            speak(actual.pregunta);
        }
    };

    const detener = () => {
        setStatus('idle');
        setIsListening(false);
        isListeningRef.current = false;
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.abort();
        releaseWakeLock();
    };

    return { isListening, status, mensaje, transcriptActual, iniciar, detener, currentData };
}

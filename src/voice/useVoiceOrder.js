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

    const speak = useCallback((text) => {
        console.info(`%c🗣️ SISTEMA: ${text}`, 'color: #3b82f6; font-weight: bold; font-size: 11px;');
        setStatus('speaking');
        window.speechSynthesis.cancel();

        if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (e) { }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        setMensaje(text);
        window.speechSynthesis.speak(utterance);

        utterance.onend = () => {
            if (isListeningRef.current && controllerRef.current?.shouldListenNext()) {
                setStatus('listening');
                setTimeout(() => startListeningRef.current?.(), 300);
            } else if (isListeningRef.current) {
                setStatus('processing');
            }
        };
    }, []);

    const handleVoiceResult = useCallback(async (text) => {
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
            // Limpiar datos actuales para el siguiente producto
            setCurrentData({
                productoActual: { tipo_producto: '', metal: '', descripcion_producto: '', cantidad: '', precio_unitario: '' }
            });
        } else if (resultado.accion === 'FIN_FASE_2') {
            setIsListening(false);
            isListeningRef.current = false;
            setStatus('completed_all');
            onConfirm({ type: 'FIN_FASE_2' });
            setTimeout(() => setStatus('idle'), 2000);
        }

        console.groupEnd();
    }, [speak, onConfirm]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (e) { }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-PE';
        recognition.interimResults = true; // Permite detectar silencio más rápido
        recognitionRef.current = recognition;

        let silenceTimer = null;

        recognition.onstart = () => {
            console.log('%c🟢 Micrófono ABIERTO', 'color: #10b981; font-style: italic;');
            setStatus('listening');

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Lógica de tiempo dinámico (Timeout Máximo)
            const actual = controllerRef.current?.getPreguntaActual();
            const esDictadoLargo = actual?.campo === 'descripcion_producto' || actual?.campo === 'direccion_entrega';
            const tiempoMax = esDictadoLargo ? 45000 : 6000;

            timeoutRef.current = setTimeout(() => {
                if (isListeningRef.current && recognitionRef.current) {
                    console.warn('⏰ Tiempo máximo alcanzado');
                    recognition.stop();
                }
            }, tiempoMax);
        };

        recognition.onresult = (e) => {
            const transcript = Array.from(e.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            setTranscriptActual(transcript);

            // Lógica de silencio de 1.5s
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                console.log('%c⏹️ Silencio detectado (1.5s)', 'color: #f59e0b;');
                recognition.stop();
            }, 1500);
        };

        recognition.onend = () => {
            if (silenceTimer) clearTimeout(silenceTimer);
            handleVoiceResult(transcriptActualRef.current);
            setTranscriptActual('');
        };

        recognition.onerror = (e) => {
            if (e.error === 'aborted') return;
            console.error('❌ Error Voz:', e.error);
            setIsListening(false);
            isListeningRef.current = false;
        };

        try { recognition.start(); } catch (e) { }
    }, [handleVoiceResult]);

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
    };

    return { isListening, status, mensaje, transcriptActual, iniciar, detener, currentData };
}

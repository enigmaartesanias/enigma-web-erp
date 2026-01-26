// src/voice/useVoiceOrder.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceController } from './speechController';

export function useVoiceOrder(onConfirm) {
    const [isListening, setIsListening] = useState(false);
    const isListeningRef = useRef(false); // Ref para evitar stale closures en speak/onend

    const [status, setStatus] = useState('idle');
    const [mensaje, setMensaje] = useState('');
    const [transcriptActual, setTranscriptActual] = useState('');

    const recognitionRef = useRef(null);
    const controllerRef = useRef(null);

    // Función para crear y configurar una nueva instancia limpia
    const createRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-PE';
        return recognition;
    }, []);

    const startListening = useCallback(() => {
        // Destruir anterior si existe
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        const recognition = createRecognition();
        recognitionRef.current = recognition;

        recognition.onstart = () => console.log('🟢 [NUEVA INSTANCIA] Micrófono INICIADO');

        recognition.onresult = async (event) => {
            const text = event.results[0][0].transcript;
            console.log('🎤 Escuchado:', text);
            setTranscriptActual(text);

            const resultado = await controllerRef.current.procesarRespuesta(text, speak);

            if (resultado.accion === 'SIGUIENTE' || resultado.accion === 'CONFIRMAR_PRODUCTO') {
                setTimeout(() => setTranscriptActual(''), 1500);
            } else if (resultado.accion === 'REPETIR') {
                setTimeout(() => setTranscriptActual(''), 3000); // Feedback de error
            } else if (resultado.accion === 'ESPERAR_CONTINUAR_MANUAL') {
                // Detener escucha visualmente y lógicamente
                setIsListening(false);
                isListeningRef.current = false;
                setStatus('waiting_manual');
                console.log('✋ Esperando continuación manual...');
            } else if (resultado.accion === 'FIN_FASE_1') {
                console.log('🏁 Fin Fase 1. Micrófono apagado.');
                setIsListening(false);
                isListeningRef.current = false;
                setStatus('completed_phase_1');
                if (recognitionRef.current) recognitionRef.current.abort();
            }

            if (resultado.accion === 'CONFIRMADO') {
                setStatus('completed');
                setIsListening(false);
                isListeningRef.current = false;
                onConfirm(resultado.pedido);
            }
        };

        recognition.onerror = (event) => {
            console.error('❌ Error Voz:', event.error);
            if (event.error === 'no-speech') {
                // Si hubo silencio, reintentar escuchar sin hablar de nuevo 
                // para no volver loco al usuario
                console.log('🔄 Silencio detectado, reintentando escuchar...');
                if (isListeningRef.current) { // Check ref
                    try { recognition.start(); } catch (e) { }
                }
            }
        };

        // Intentar iniciar
        try {
            recognition.start();
        } catch (e) {
            console.error('Error al iniciar mic:', e);
        }
    }, [onConfirm, createRecognition]); // speak se pasa como argumento, no dependencia aqui para evitar ciclos

    const speak = useCallback((text) => {
        // 1. Detener todo
        window.speechSynthesis.cancel();
        if (recognitionRef.current) try { recognitionRef.current.abort(); } catch (e) { }

        // 2. Hablar
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        setMensaje(text);

        window.speechSynthesis.speak(utterance);

        // 3. Programar inicio de micrófono (CONTROLADO)
        utterance.onend = () => {
            // Solo escuchar si el controlador dice que el SIGUIENTE paso requiere voz
            // Usamos REF para estado actual real
            if (isListeningRef.current && controllerRef.current && controllerRef.current.shouldListenNext()) {
                console.log('🎤 Reactivando micrófono para siguiente campo...');
                startListening();
            } else {
                console.log('🛑 Micrófono PAUSADO (esperando input manual o no requerido)');
                // Si pausamos, podríamos querer actualizar la UI visualmente si fuera necesario, 
                // pero por ahora mantenemos isListening=true en UI si solo estamos "esperando" 
                // para no confundir al usuario, o tal vez deberíamos ponerlo en standby.
                // Sin embargo, si el usuario debe continuar a mano, quizás lo mejor es dejarlo en listening
                // O mejor aun, si estamos en 'ESPERAR_CONTINUAR_MANUAL', el voiceController debería manejar el estado.
            }
        };

    }, [startListening]); // Dependencias mínimas

    // Inicialización
    useEffect(() => {
        controllerRef.current = new VoiceController();
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) recognitionRef.current.abort();
        };
    }, []);

    const iniciar = useCallback(() => {
        controllerRef.current.reset();
        setIsListening(true);
        isListeningRef.current = true; // Sync ref
        setStatus('listening');
        setTranscriptActual('');

        const primera = controllerRef.current.getPreguntaActual();
        speak(primera.pregunta);
    }, [speak]);

    const detener = useCallback(() => {
        setIsListening(false);
        isListeningRef.current = false; // Sync ref
        setStatus('idle');
        setMensaje('');
        setTranscriptActual('');
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.abort();
    }, []);

    return { isListening, status, mensaje, transcriptActual, iniciar, detener };
}

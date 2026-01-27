# Documentación Técnica: Sistema de Voz (VUI)

Este documento sirve como referencia técnica para desarrolladores que deseen mantener o expandir el sistema de registro por voz.

## Estructura de Archivos
- `src/voice/useVoiceOrder.js`: Hook principal que encapsula la Web Speech API.
- `src/voice/speechController.js`: Lógica de negocio y flujo de preguntas (State Machine).
- `src/voice/speechParser.js`: Utilidades de parsing y NLP básico.
- `src/components/VoiceDialog.jsx`: Interfaz de usuario flotante.

## Tecnologías Utilizadas
1. **Web Speech API**: Para reconocimiento (SpeechRecognition) y síntesis (SpeechSynthesis).
2. **Screen Wake Lock API**: Para prevenir que el dispositivo móvil apague la pantalla durante el dictado.
3. **Regex & NLP**: Procesamiento de texto para extracción de datos financieros y cantidades.

## Flujos Críticos
- **Sincronización**: Al iniciar, el sistema lee los valores actuales del formulario para evitar sobrescritura.
- **Validación**: Campos obligatorios vs opcionales definidos en el controlador.
- **Revisión**: Al finalizar todas las fases, se dispara un evento `FIN_VOZ_TOTAL` que activa un modal de resumen en el componente padre.

## Tiempos de Silencio (Configuración)
| Campo | Timeout Silencio | Razón |
| :--- | :--- | :--- |
| General | 2.5s | Balance entre rapidez y espera. |
| Dictado | 4.0s - 5.0s | Permite al usuario pensar en detalles largos. |
| Números | 1.0s - 1.2s | Entrada rápida para flujo ágil. |

## Mantenimiento
Para agregar una nueva pregunta al flujo, simplemente edite la constante `FLUJO` en `speechController.js`.

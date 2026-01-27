# Wiki: Sistema de Voz (Registro de Pedidos)

Este módulo es una pieza fundamental del **ENIGMA ERP**, diseñada para permitir el ingreso de pedidos mediante comandos de voz naturales. El sistema está actualmente **en producción y sincronizado con la base de datos Neon**.

## Flujo Operativo
El sistema guía al usuario por una serie de preguntas siguiendo este flujo:
1.  **Captura de Identidad**: Nombre, Teléfono y DNI/RUC del cliente.
2.  **Entrada de Inventario**: Selección de Metal y Tipo mediante **menús desplegables controlados por voz**, además de descripción, cantidad y precio.
3.  **Logística de Envío**: Selección de modalidad y registro de dirección de entrega.
4.  **Finalización de Pago**: Método de pago, IGV y registro de adelanto.

## Dinámica de Voz (Pregunta-Respuesta)
- El sistema **pregunta** cada campo usando síntesis de voz (TTS).
- El usuario **responde** y el sistema actualiza visualmente los inputs y selects del formulario.
- **Validación Inteligente**: Si un dato es detectado como inválido o falta, el sistema repite la solicitud de forma amigable ("Te escucho. Por favor, dime la cantidad").

## Confirmación y Persistencia
Tras completar el flujo, se dispara un **Modal de Confirmación Final**. Este modal resume la información y, tras la aprobación humana, realiza el `INSERT` en la tabla `pedidos` de la base de datos **Neon (PostgreSQL)**.

## Características Técnicas
- **Wake Lock**: Evita la suspensión del móvil.
- **NLP Básico**: Extracción de números y lógica de menús desde el habla.
- **Comandos Especiales**: "Listo", "Terminé" o "Fin" para cierre inmediato.

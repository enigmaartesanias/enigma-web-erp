# 🎙️ Sistema Pro de Registro por Voz - ENIGMA ERP
## Guía Técnica y Académica (v5.0 - Enero 2026)

Este sistema forma parte integral del **ENIGMA ERP**, un ecosistema diseñado para la gestión de artesanías. Su función específica es automatizar el **Registro de Pedidos**, permitiendo que los operarios o vendedores ingresen datos de forma manos libres, optimizando el tiempo y reduciendo errores de transcripción.

---

## 🏗️ 1. Contexto y Propósito
El módulo de **Registro de Pedidos por Voz** es una interfaz inteligente (VUI) que interactúa directamente con la base de datos de **Neon (PostgreSQL)**. Su propósito es guiar al usuario a través de un flujo estructurado para capturar toda la información necesaria sin necesidad de usar el teclado.

### 📋 Campos Capturados en el Flujo
El sistema sigue un flujo lógico dividido en fases, donde cada campo se valida en tiempo real:
1.  **Datos del Cliente:** Nombre, Teléfono, DNI/RUC.
2.  **Detalles del Producto (Loop):** Material (Metal), Tipo de Producto, Descripción Detallada, Cantidad y Precio.
3.  **Gestión de Envío:** Requiere envío (SÍ/NO), Dirección, Modalidad y Costo.
4.  **Confirmación de Pago:** Forma de pago, Comprobante e IGV.

---

## 📊 2. Arquitectura y Flujo de Datos

El sistema sigue un modelo de **Arquitectura Desacoplada** donde la interfaz, la lógica de control y el procesamiento de lenguaje natural (NLP) están en capas separadas.

### � Dinámica de Interacción (Voz <-> Sistema)
- **Pregunta:** El sistema utiliza *Text-to-Speech* para realizar preguntas claras basadas en el paso actual.
- **Escucha:** Activa el micrófono con tiempos de silencio dinámicos según la complejidad del campo.
- **Analiza:** El `speechParser` limpia y extrae los datos (ej: convierte "cincuenta soles" en el número `50.00`).
- **Responde:** Si falta un dato obligatorio o no es válido, el sistema pide amablemente la información ("Te escucho. Por favor dime...").
- **Visualiza:** Mientras el usuario habla, los inputs del formulario y los menús desplegables (Selects) se actualizan en tiempo real en la interfaz.

---

## 📂 3. Estructura de Archivos (El Equipo de Trabajo)

| Archivo | Rol | Función en el ERP |
| :--- | :--- | :--- |
| `useVoiceOrder.js` | **Motor (Engine)** | `Hooks`: Gestiona micrófono, Wake Lock (pantalla activa) y ciclo de vida de la sesión. |
| `speechController.js` | **Cerebro (State Machine)** | `Lógica`: Controla el flujo secuencial de preguntas y la sincronización con la BD Neon. |
| `speechParser.js` | **Traductor (NLP)** | `Procesamiento`: Extrae números, booleanos y opciones de menús desde el audio. |
| `VoiceDialog.jsx` | **Cara (UI)** | `Componente`: Panel flotante que muestra la transcripción y el estado actual. |

---

## 🚀 4. Innovaciones UX (Premium Experience)

El sistema ya está **en línea y operativo**, integrando estas características avanzadas:

### A. 📱 Wake Lock API (Pantalla Siempre Activa)
Garantiza que el dispositivo móvil no suspenda la pantalla mientras el usuario dicta el pedido, vital para el uso en talleres o almacenes.

### B. ⏱️ Regla de Oro: Silencio Dinámico
- **Filtro de Focus:** Tiempos cortos (1s) para campos rápidos como "Cantidad".
- **Modo Dictado:** Tiempos largos (5s) para campos de texto libre como "Dirección".

### C. 🛑 Comandos Verbales & Menús
- El usuario puede interactuar con **menús desplegables** (Metal, Tipo de Producto) simplemente mencionando las opciones.
- **Cierre Rápido:** Al decir "Listo" o "Fin", el sistema detiene el audio y procesa la información capturada.

### D. 📋 Modal de Confirmación Humana
Al finalizar el dictado, el sistema **no guarda a ciegas**. Despliega un **Modal de Confirmación** que:
1.  Resume todos los datos capturados.
2.  Lee verbalmente el resumen al usuario.
3.  Permite guardar en **Neon DB** con un clic o realizar ajustes manuales.

---

## 🛠️ 5. Robustez y Errores
- **Resiliencia:** Si el reconocimiento falla por ruido externo, el sistema se mantiene en espera con mensajes motivadores ("Te escucho, continúa").
- **Sincronización:** Si el usuario ya llenó parte del formulario manualmente, el sistema detecta esos valores y salta esas preguntas automáticamente.

---
**Tecnología:** Web Speech API, Wake Lock API, React 18, Neon PostgreSQL.
**Estado:** Producción (En Línea).

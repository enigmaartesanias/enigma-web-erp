# Sistema de Voz: Registro Rápido (v3.1.0) 🎤

El Sistema de Voz de Aldo Artesanías está diseñado para agilizar el registro de pedidos mediante comandos de voz optimizados para la velocidad y la precisión.

## 🚀 Filosofía del Sistema
- **Velocidad sobre Confirmación**: El sistema no repite los datos. El usuario verifica visualmente en pantalla.
- **Control Humano**: Si la voz falla, el usuario corrige manualmente.
- **Micro-sesiones**: El micrófono se activa solo para campos específicos y se apaga proactivamente para evitar errores.

## 📋 Flujo de Trabajo (Fase 1: Datos Personales)

El sistema guía al usuario a través de tres campos críticos:

1.  **Nombre del Cliente**: 
    - El sistema pregunta: *"¿Nombre del cliente?"*.
    - El usuario responde.
    - El sistema avanza inmediatamente al siguiente campo en silencio.
    
2.  **Teléfono**:
    - El sistema pregunta: *"¿Teléfono?"*.
    - El usuario dicta los números.
    - El sistema avanza en silencio.

3.  **RUC / DNI (Opcional)**:
    - El sistema pregunta: *"RUC o DNI, puedes decir no"*.
    - Si el usuario dice un número, se registra.
    - Si el usuario dice *"No"*, *"Paso"* o *"Nada"*, se registra como `null`.
    - **Cierre**: El sistema dice *"Datos personales registrados"* y **apaga el micrófono automáticamente**.

## 🛠️ Comandos Admitidos

### Respuestas Negativas (RUC/DNI)
Para omitir el campo de documento, puedes decir:
- "No"
- "Paso"
- "Ninguno"
- "Sin registro"
- "Omitir"

## 📐 Detalles Técnicos

### Arquitectura de Control
El sistema utiliza un controlador desacoplado (`VoiceController`) y un hook de React (`useVoiceOrder`) que gestiona el estado del `SpeechRecognition` de manera robusta usando `Refs` para evitar:
- Bucles infinitos de escucha.
- Reactivaciones accidentales en campos no compatibles.
- Cierres de sesión por pérdida de foco.

### Whitelist de Voz
Actualmente, el micrófono solo se reactiva automáticamente para los siguientes campos:
- `nombre_cliente`
- `telefono`
- `ruc_dni`

Cualquier otro campo (como el detalle de productos) requiere entrada manual o activación manual del micrófono para garantizar la precisión en datos complejos.

## 💡 Consejos para el Usuario
- **Hable claro**: No es necesario gritar, pero la pronunciación clara ayuda.
- **Verifique la pantalla**: El sistema es rápido. Si el nombre sale mal (ej. "Aldo" por "Ronaldo"), simplemente corríjalo con el teclado antes de continuar.
- **Fase de Productos**: Una vez finalizada la Fase 1, se recomienda usar el selector manual para productos, ya que permite mayor detalle técnico (tipos, metales, precios).

---

**Última actualización**: Enero 2026
**Diseñado para**: Operación rápida en taller y ventas.

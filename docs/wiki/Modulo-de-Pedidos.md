# Módulo de Pedidos

El Módulo de Pedidos permite gestionar todo el ciclo de vida de un pedido, desde la solicitud del cliente hasta la entrega final, pasando por la producción y el pago.

## 🌟 Características Principales

### 1. Gestión de Estados
El pedido pasa por un flujo claro de estados:
- **Pendiente**: Recién creado, esperando confirmación o pago inicial.
- **En Producción**: El pedido ha sido enviado al taller.
- **Terminado**: La producción ha finalizado (joya lista), pero aún no se entrega al cliente.
- **Entregado**: El producto ha sido entregado al cliente (estado final histórico).

### 2. Diferenciación Terminados vs Entregados
- **Pestaña terminados**: Muestra pedidos listos para recoger. Muestra botones para Marcar como Entregado.
- **Pestaña Entregados**: Historial de pedidos entregados. **Solo lectura**. Muestra la *Fecha de Entrega* en lugar de la fecha de pedido.

### 3. Nota de Pedido (Comprobante)
Diseño minimalista y optimizado para impresión térmica o visualización digital:
- **Encabezado**: Datos del cliente y negocio.
- **Productos**: Formato compacto *Tipo - Metal* (ej: "Pulsera - Alpaca") seguido de la descripción.
- **Totales**: Cálculo automático de Subtotal, IGV (opcional) y Total.
- **Disclaimer**: Texto legal en formato reducido.

### 4. Producción Automática
Al crear un pedido, el sistema detecta automáticamente si el stock es insuficiente (o si es un pedido personalizado) y puede generar una orden de producción vinculada.

### 5. Pagos y Saldos
- Registro de pagos a cuenta.
- Cálculo automático del saldo pendiente.
- Alerta al intentar entregar si existe saldo pendiente.

## 🛠️ Flujo de Trabajo Típico

1.  **Registrar Pedido**: Ingresar cliente, seleccionar tipo de producto, metal y detalles.
2.  **Enviar a Producción**: Si requiere fabricación.
3.  **Marcar como Terminado**: Cuando el taller finaliza.
4.  **Entregar**:
    - Ir a la pestaña "Terminados".
    - Verificar saldo (cobrar si falta).
    - Clic en "Entregar".
    - El pedido se mueve a la pestaña "Entregados" y se registra la `fecha_entrega`.

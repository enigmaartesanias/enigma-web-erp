# Módulo de Pedidos (v2.6.0)

El Módulo de Pedidos gestiona el ciclo de vida completo: solicitud, producción, pago y entrega.

## 🌟 Características Principales (Actualizado Enero 2026)

### 1. Gestión de Estados
El pedido transita por:
- **Pendiente**: Recién creado, esperando confirmación.
- **En Producción**: Orden enviada al taller.
- **Terminado (Listos)**: Producción finalizada, listo para retiro.
- **Entregado**: Producto entregado al cliente (Estado Final).

### 2. Flujo de Entrega Estricto 🚚
Para evitar entregas prematuras:
- **Solo se puede entregar desde la pestaña "Listos" (Terminados).**
- El botón de entrega (`FaCar`) **NO** aparece en la fase de Producción.
- Al entregar, el pedido se mueve a la pestaña "Entregados" y se registra la fecha.

### 3. Pagos Flexibles 💳
El sistema permite cobrar en cualquier momento:
- **Botón de Pago Siempre Disponible**: Si hay saldo pendiente (`> 0`), el botón `FaMoneyBillWave` aparece en todas las pestañas (Pendientes, Producción, Listos, e incluso Entregados).
- **Pagos desde Reporte**: Ahora es posible registrar pagos directamente desde el "Consulta de Pedidos" sin ir a la gestión principal.
- **Estado de Pago Independiente**: Un pedido puede estar "Entregado" pero con "Saldo Pendiente" (fiado), permitiendo su regularización posterior.

### 4. Nota de Pedido
Diseño optimizado para impresión térmica:
- Formato **Ticket 80mm**.
- Detalle claro: *Tipo - Metal*.
- **Totales**: Subtotal, IGV y Total.
- **Estado de Cuenta**: Muestra pagos a cuenta y saldo restante al pie del ticket.

### 5. Interfaz de Usuario
- **Botón Ver Detalle (`FaEye`)**: Acceso rápido a la visualización de la Nota de Pedido.
- **Contadores de Pestañas**: Indicadores numéricos de cantidad de pedidos por estado.
- **Alertas Visuales**: Badges de colores para estado de producción y pago.

## 🛠️ Flujo de Trabajo Típico

1.  **Registrar Pedido**: Ingresar solicitud del cliente.
2.  **Enviar a Producción**: Si no hay stock.
3.  **Seguimiento**:
    - Consultar estado en pestaña "Producción".
    - Registrar adelantos con botón `FaMoneyBillWave`.
4.  **Terminar**: Marcar como "Terminado" cuando sale de taller.
5.  **Entregar**:
    - Ir a pestaña "Listos".
    - Verificar saldo (el botón de pago aparecerá si debe).
    - Clic en `FaCar` (Entregar).
6.  **Post-Entrega**:
    - Si quedó saldo, cobrar posteriormente en pestaña "Entregados" o desde el Reporte.

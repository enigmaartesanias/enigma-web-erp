# Módulo de Ventas

El módulo de ventas es el corazón del sistema ERP, permitiendo registrar, gestionar y analizar todas las transacciones de venta.

## 📋 Características

### Sistema de Pestañas
El reporte de ventas está organizado en dos pestañas:

#### VENTAS (Activas)
- Muestra todas las ventas con estado diferente a "ANULADA"
- Incluye estadísticas de ventas activas
- Permite anular ventas desde esta vista

#### ANULADAS
- Muestra solo ventas anuladas
- Estadísticas de ventas anuladas
- Solo permite ver detalles (no se pueden anular nuevamente)

### Código de Venta Correlativo

El sistema genera automáticamente códigos de venta en formato profesional:

**Formato**: `0001`, `0002`, `0003`, etc.

**Características**:
- ✅ Generación automática consultando el último código
- ✅ 4 dígitos con ceros a la izquierda
- ✅ Compatible con ventas antiguas (formato V-timestamp)
- ✅ Incremento automático

**Ejemplo**:
```
Primera venta: 0001
Segunda venta: 0002
Tercera venta: 0003
...
Venta 9999: 9999
Venta 10000: 10000 (se expande automáticamente)
```

### Anulación de Ventas

El sistema implementa un proceso profesional de anulación:

**Proceso**:
1. Click en botón "Anular" (solo en pestaña VENTAS)
2. Se abre modal de confirmación
3. Ingresar motivo de anulación (obligatorio)
4. Confirmar anulación

**Efectos**:
- ✅ Cambia estado de venta a "ANULADA"
- ✅ Revierte el stock automáticamente
- ✅ Registra motivo y fecha de anulación
- ✅ Excluye de totales financieros
- ✅ Mantiene el registro para auditoría

**Importante**:
> Las ventas anuladas NO se eliminan. Se mantienen en el historial para trazabilidad y auditoría.

### Estadísticas en Tiempo Real

El sistema muestra 4 cards de estadísticas que se actualizan según la pestaña activa:

1. **Total Ventas**: Suma de todas las ventas
2. **IGV Acumulado**: Total de impuestos
3. **Cantidad**: Número de ventas
4. **Promedio**: Ticket promedio

**Comportamiento**:
- En pestaña **VENTAS**: Solo incluye ventas activas
- En pestaña **ANULADAS**: Solo incluye ventas anuladas

### Filtros de Fecha

Filtros compactos en 2 columnas:

- **Fecha Inicio**: Filtrar desde una fecha
- **Fecha Fin**: Filtrar hasta una fecha
- **Botón Limpiar**: Resetea ambos filtros

**Formato de fecha en tabla**: DD/MM/YY (compacto, sin hora)

### Tabla Responsive

La tabla se adapta automáticamente al tamaño de pantalla:

**Desktop (> 768px)**:
- Todas las columnas visibles
- Código, Fecha, Cliente, Subtotal, IGV, Descuento, Total, Estado, Acciones

**Móvil (< 768px)**:
- Columnas esenciales: Código, Fecha, Total, Estado, Acciones
- Columnas ocultas: Cliente, Subtotal, IGV, Descuento
- Scroll horizontal disponible

## 🎯 Casos de Uso

### Registrar una Nueva Venta (Rediseño Enero 2026) ✨

El proceso de venta ha sido optimizado con una interfaz minimalista y **mobile-first**:

1.  **Entorno**: Ir a **Ventas** → **Nueva Venta**.
2.  **Búsqueda**: Buscar productos por nombre o código (compatible con escáner QR).
3.  **Carrito Dinámico**:
    *   **En Desktop**: Lista de productos a la izquierda y resumen a la derecha.
    *   **En Móvil**: Lista integrada directamente en el resumen para una gestión táctil fluida.
4.  **Selección de Cliente**: Acceso instantáneo desde la cabecera del resumen para asignar el cliente.
5.  **Forma de Pago**: Selección visual rápida entre:
    *   **EFEC (Efectivo)**
    *   **DIGIT (Digital - Yape/Plin/Transf)**
    *   **CRED (Crédito)**: Activa el flujo de confirmación de crédito.
6.  **Acción Final**: Botón unificado "Cobrar / Confirmar Crédito" con diseño minimalista oscuro.

**Mejoras UX Recientes**:
- ✅ **Sin distracciones**: Eliminación de negritas innecesarias y reducción de tamaños de fuente.
- ✅ **Inputs limpios**: El símbolo "S/" ya no se solapa con el precio en la edición por ítem.
- ✅ **Estabilidad**: Protección contra errores de carga si el cliente no está seleccionado.

### Anular una Venta

1. Ir a **Ventas** → **Reporte de Ventas**
2. Asegurarse de estar en pestaña **VENTAS**
3. Click en botón "Anular" (ícono prohibido amarillo)
4. Ingresar motivo de anulación
5. Confirmar

**Resultado**:
- Venta cambia a estado "ANULADA"
- Stock se revierte automáticamente
- Venta se mueve a pestaña ANULADAS
- Estadísticas se actualizan

### Ver Detalle de una Venta

1. Ir a **Ventas** → **Reporte de Ventas**
2. Click en botón "Ver detalle" (ícono ojo azul)
3. Se abre modal con información completa

**Información mostrada (Actualizado Enero 2026)**:
- Código de venta
- Fecha y hora
- Cliente (si existe)
- **Lista de Productos**: Con precio total inline por item
- **IGV**: Solo se muestra si es mayor a 0.00
- Descuento (si aplica)
- Total
- Estado
- Motivo de anulación (si está anulada)

## 🔧 Configuración Técnica

### Base de Datos

**Tabla**: `ventas`

Campos principales:
- `id`: ID único
- `codigo_venta`: Código correlativo (VARCHAR)
- `cliente_nombre`: Nombre del cliente
- `cliente_documento`: Documento del cliente
- `subtotal`: Subtotal sin impuestos
- `impuesto_monto`: Monto de IGV
- `descuento_monto`: Monto de descuento
- `total`: Total de la venta
- `estado`: ACTIVA | ANULADA
- `motivo_anulacion`: Motivo (si está anulada)
- `fecha_anulacion`: Fecha de anulación
- `fecha_venta`: Fecha de registro

**Tabla**: `detalles_venta`

Campos principales:
- `id`: ID único
- `venta_id`: Referencia a venta
- `producto_id`: Referencia a producto
- `cantidad`: Cantidad vendida
- `precio_unitario`: Precio por unidad
- `producto_nombre`: Nombre del producto
- `producto_codigo`: Código del producto

### Archivos Clave

**Frontend**:
- `src/modules/ventas/pages/NuevaVenta.jsx` - Formulario de venta
- `src/modules/ventas/pages/ReporteVentas.jsx` - Reporte con pestañas
- `src/modules/ventas/components/ResumenVenta.jsx` - Resumen de venta
- `src/modules/ventas/components/BuscadorProducto.jsx` - Buscador

**Backend**:
- `src/utils/ventasClient.js` - CRUD de ventas

## 📊 Mejores Prácticas

### Para Usuarios

1. **Siempre verificar** el cliente antes de confirmar venta
2. **Revisar el stock** antes de vender
3. **Ingresar motivo claro** al anular ventas
4. **Usar filtros de fecha** para análisis periódicos
5. **Verificar totales** antes de confirmar

### Para Desarrolladores

1. **Validar stock** antes de procesar venta
2. **Usar transacciones** para operaciones críticas
3. **Manejar errores** con mensajes claros
4. **Mantener trazabilidad** (no eliminar registros)
5. **Optimizar queries** para reportes grandes

## ❓ Preguntas Frecuentes

**¿Puedo eliminar una venta?**
No. Las ventas solo se anulan para mantener trazabilidad.

**¿Qué pasa con el stock al anular?**
Se revierte automáticamente. Los productos vuelven al inventario.

**¿Las ventas anuladas afectan los reportes?**
No. Se excluyen de totales financieros pero se mantienen en el historial.

**¿Puedo cambiar el código de venta?**
No. El código se genera automáticamente y no se puede modificar.

**¿Qué pasa si hay un error al anular?**
El sistema muestra un mensaje de error y no realiza cambios.

---

**Última actualización**: Enero 2026

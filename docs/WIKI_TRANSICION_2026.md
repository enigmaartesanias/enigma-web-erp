# Wiki - Transición al Año 2026

## Resumen Ejecutivo

La **Transición 2026** es un sistema implementado para facilitar el inicio de un nuevo año fiscal/operativo sin eliminar datos históricos. Permite que el ERP comience "limpio" para 2026 mientras mantiene accesible toda la información de años anteriores.

## Objetivo

Proporcionar a los usuarios:
- Un **inventario limpio** para el nuevo año
- **Reportes enfocados en 2026** por defecto
- **Acceso a datos históricos** mediante filtros cuando sea necesario
- **Continuidad operativa** para pedidos pendientes de años anteriores

## Componentes Técnicos

### 1. Migración de Base de Datos

#### Script SQL: `transition_2026.sql`

```sql
-- 1. Agregar columna 'estado_activo' a productos_externos
ALTER TABLE productos_externos 
ADD COLUMN IF NOT EXISTS estado_activo BOOLEAN DEFAULT TRUE;

-- 2. Archivar productos anteriores a 2026
UPDATE productos_externos 
SET estado_activo = FALSE 
WHERE fecha_registro < '2026-01-01 00:00:00';
```

**Resultado**: 17 productos archivados (marcados como inactivos)

**Tabla afectada**:
- `productos_externos`: Nueva columna `estado_activo` (BOOLEAN)

### 2. Filtrado de Inventario

#### Archivo: `src/utils/productosExternosNeonClient.js`

**Cambios en `getAll()`**:
```javascript
async getAll() {
  const productos = await sql`
    SELECT * FROM productos_externos 
    WHERE estado_activo = TRUE 
    ORDER BY fecha_registro DESC
  `;
  return productos;
}
```

**Cambios en `search()`**:
```javascript
WHERE 
  estado_activo = TRUE AND (
    LOWER(nombre) LIKE ${`%${query.toLowerCase()}%`}
    OR LOWER(codigo_usuario) LIKE ${`%${query.toLowerCase()}%`}
  )
```

**Impacto**:
- El inventario visible ahora muestra solo productos activos (2026+)
- Los productos de 2025 permanecen en la base de datos pero no se muestran
- Las búsquedas solo retornan productos activos

### 3. Reportes por Defecto en 2026

#### Archivos Modificados:
1. `src/components/ReportePedidos.jsx`
2. `src/modules/ventas/pages/ReporteVentas.jsx`

**Cambio en fecha por defecto**:
```javascript
// ANTES:
const [fechaInicio, setFechaInicio] = useState('');
const [fechaFin, setFechaFin] = useState('');

// DESPUÉS:
const [fechaInicio, setFechaInicio] = useState('2026-01-01');
const [fechaFin, setFechaFin] = useState('2026-12-31');
```

**Impacto**:
- Al abrir los reportes, se muestran automáticamente datos del 2026
- Los usuarios pueden borrar filtros o cambiar fechas para ver años anteriores

### 4. Vista Híbrida de Pedidos

#### Archivo: `src/components/ReportePedidos.jsx`

**Lógica de filtrado híbrido** (líneas 79-95):

```javascript
data = allPedidos.filter(p => {
    const fechaPedidoStr = new Date(p.fecha_pedido).toISOString().split('T')[0];
    const enRango = fechaPedidoStr >= start && fechaPedidoStr <= end;

    // Lógica Híbrida 2026: Incluir pedidos antiguos si están "activos"
    const esAntiguoActivo = !enRango && 
                          fechaPedidoStr < start && 
                          (
                            (Number(p.monto_saldo) > 0) || 
                            (p.estado_produccion && 
                             p.estado_produccion !== 'terminado' && 
                             p.estado_produccion !== 'entregado')
                          );

    return enRango || esAntiguoActivo;
});
```

**Comportamiento**:
- Muestra todos los pedidos de 2026 (dentro del rango de fechas)
- **PLUS**: Incluye automáticamente pedidos de 2025 que tienen:
  - Saldo pendiente (`monto_saldo > 0`)
  - Estado de producción activo (no terminado ni entregado)

## Corrección de Timezone

### Problema Identificado
Las ventas mostraban fechas incorrectas debido a problemas de interpretación de zona horaria (UTC vs America/Lima).

### Solución Implementada

#### Archivo: `src/modules/ventas/pages/ReporteVentas.jsx`

**Filtrado con timezone correcto**:
```javascript
// Convertir fecha de venta a YYYY-MM-DD en zona horaria de Perú
const fechaVentaDate = new Date(venta.fecha_venta);
const fechaVentaPeru = fechaVentaDate.toLocaleDateString('en-CA', { 
  timeZone: 'America/Lima' 
});

// Comparar strings de fecha
if (fechaInicio && fechaVentaPeru < fechaInicio) return false;
if (fechaFin && fechaVentaPeru > fechaFin) return false;
```

**Display con timezone correcto**:
```javascript
{new Date(venta.fecha_venta).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'America/Lima'
})}
```

## Mejoras de UI

### Nota de Pedido - Disclaimer Compacto

**Archivo**: `src/components/Pedidos.jsx` y `ReportePedidos.jsx`

**Cambio de tamaños de fuente**:
```javascript
// ANTES: text-[6px], text-[5px] (no funcional en Tailwind)
// DESPUÉS:
<p className="text-xs text-gray-500 uppercase tracking-wide">
  Aclaración Importante
</p>
<p className="text-xs text-gray-500 leading-snug">
  Esta Nota de Pedido no tiene validez como comprobante de pago.
</p>
<p className="text-xs text-gray-600 font-semibold mt-0.5">
  ¡Gracias por tu pedido!
</p>
```

**Motivo**: Los tamaños arbitrarios muy pequeños (`text-[3px]`, `text-[4px]`) no se renderizan correctamente en todos los navegadores.

### Reporte de Materiales - UX Móvil

**Archivo**: `src/modules/materiales/pages/ReporteMateriales.jsx`

**Nuevo Layout Responsivo**:
- **Desktop**: Grid/Tabla vertical estándar.
- **Móvil**: Contenedor con `overflow-x-auto` (Scroll Horizontal).
  - Permite visualizar todas las columnas (Fecha, Material, Proveedor, Cantidad, Total, Acciones) sin romper el diseño "card".
  - Estilo similar a una hoja de cálculo compacta.

**Cambios en Columnas**:
- **Agregado**: Columna `Proveedor` para rápida identificación.
- **Removido**: Columna `P. Unit` para simplificar la vista (se mantiene Cantidad y Total).

### 5. Rediseño del Dashboard Zen (v3.0.0)

**Archivo**: `src/modules/inventario/pages/InventarioHome.jsx`

**Impacto Visual y UX**:
- **Estética "Zen"**: Nueva interfaz ultra-minimalista que utiliza el contraste entre el fondo neutral (`bg-neutral-50`) y las tarjetas blancas flotantes para separar claramente cada módulo.
- **Jerarquía Visual**: Los iconos principales ahora cargan la identidad cromática del área (Ventas: Azul, Pedidos: Ámbar, Producción: Esmeralda), mientras que los reportes y textos secundarios se mantienen en gris minimalista.
- **Optimización Mobile**: Se ha forzado un layout de 2 columnas en dispositivos móviles para que el usuario pueda ver la gestión y su reporte correspondiente lado a lado, reduciendo el scroll infinito.
- **Micro-copy UX**: Sustitución de etiquetas genéricas por verbos de acción directa (*"Gestionar"*, *"Entrar"*, *"Ver"*).

## Flujo de Trabajo para Nuevos Años

Para replicar esta transición en años futuros (ej. 2027):

### 1. Ejecutar Script SQL
```sql
-- Actualizar año objetivo
UPDATE productos_externos 
SET estado_activo = FALSE 
WHERE fecha_registro < '2027-01-01 00:00:00';
```

### 2. Actualizar Filtros por Defecto
```javascript
// En ReportePedidos.jsx y ReporteVentas.jsx
const [fechaInicio, setFechaInicio] = useState('2027-01-01');
const [fechaFin, setFechaFin] = useState('2027-12-31');
```

### 3. (Opcional) Ajustar Lógica Híbrida
Si se requiere cambiar la definición de "pedido activo", modificar la condición `esAntiguoActivo` en `ReportePedidos.jsx`.

## Verificación Post-Implementación

### Checklist de Validación

- [ ] **Inventario**: Solo muestra productos de 2026
- [ ] **Reportes**: Abren con filtros de fecha en 2026
- [ ] **Pedidos**: Muestra pedidos de 2026 + pendientes de 2025
- [ ] **Ventas**: Las fechas se muestran correctamente en hora de Perú
- [ ] **Búsquedas**: Solo encuentran productos activos
- [ ] **Acceso histórico**: Los datos de 2025 son accesibles al limpiar filtros

### Comandos SQL de Verificación

```sql
-- Ver productos archivados
SELECT COUNT(*) FROM productos_externos WHERE estado_activo = FALSE;

-- Ver productos activos
SELECT COUNT(*) FROM productos_externos WHERE estado_activo = TRUE;

-- Ver distribución por año
SELECT 
  EXTRACT(YEAR FROM fecha_registro) AS año,
  estado_activo,
  COUNT(*) AS cantidad
FROM productos_externos
GROUP BY año, estado_activo
ORDER BY año DESC;
```

## Arquitectura de Datos

### Esquema de `productos_externos`

```sql
CREATE TABLE productos_externos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_usuario TEXT NOT NULL,
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    costo DECIMAL(10, 2) DEFAULT 0,
    precio DECIMAL(10, 2) DEFAULT 0,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    unidad TEXT DEFAULT 'Unidad',
    imagen_url TEXT,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    estado_activo BOOLEAN DEFAULT TRUE  -- ✨ NUEVA COLUMNA
);
```

**Diferencia entre `activo` y `estado_activo`**:
- `activo`: Indica si el producto está disponible para venta (gestión manual)
- `estado_activo`: Indica si el producto pertenece al año fiscal activo (gestión automática por año)

## Beneficios

### Para el Usuario
1. **Interfaz limpia**: No se sobrecarga con datos antiguos
2. **Enfoque en el presente**: Métricas y reportes relevantes al año actual
3. **Continuidad**: No pierde visibilidad de trabajos pendientes del año anterior
4. **Flexibilidad**: Acceso a históricos cuando sea necesario

### Para el Sistema
1. **Performance**: Menos datos en consultas por defecto
2. **Escalabilidad**: Patrón replicable para futuros años
3. **Integridad**: No se eliminan datos, solo se filtran
4. **Auditoría**: Historial completo preservado

## Notas Técnicas

### Timezone Management
El sistema usa `America/Lima` (UTC-5) como zona horaria estándar para:
- Filtrado de fechas
- Visualización de fechas
- Comparaciones de fechas

### Database Timestamps
Neon PostgreSQL almacena timestamps en UTC. La conversión a hora local se hace en la capa de aplicación.

### Future Considerations
- **Backups**: Crear respaldos antes de cada transición anual
- **Reportes anuales**: Considerar generar reportes consolidados de cada año antes de archivarlo
- **Performance**: Monitorear el crecimiento de datos archivados, considerar estrategias de particionamiento si es necesario

---

**Última actualización**: Enero 1, 2026  
**Versión del sistema**: v2.3.0

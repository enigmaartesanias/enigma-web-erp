# Wiki - Modal de Inventariar

## Descripción General

El Modal de Inventariar permite convertir items de compra en productos de inventario de forma rápida y eficiente, con pre-llenado automático de datos.

## Ubicación

**Acceso**: Compras → Reporte de Compras → Botón "+ Invent." en items pendientes

## Flujo de Trabajo

### 1. Desde Reporte de Compras

1. Ir a **Compras** → **Reporte de Compras**
2. Localizar item con estado "⏳ Pendiente"
3. Click en botón **"+ Invent."**
4. Se abre el modal con datos prellenados

### 2. Datos Pre-llenados Automáticamente

El modal carga automáticamente:
- ✅ **Nombre**: Del item de compra
- ✅ **Costo**: Del item de compra
- ✅ **Stock Inicial**: Cantidad comprada
- ✅ **Imagen**: Si existe en el item

### 3. Completar Datos Faltantes

Campos obligatorios a completar:
- **Código IQ**: Código único (se convierte a MAYÚSCULAS automáticamente)
- **Categoría**: Seleccionar tipo de producto (ANILLO, ARETE, etc.)
- **Precio**: Precio de venta

Campos opcionales:
- **Stock Mínimo**: Alerta de stock bajo
- **Precio Oferta**: Precio promocional
- **Descripción**: Información adicional

### 4. Guardar

1. Click en **"Guardar"**
2. El producto se crea en inventario
3. El item se marca como ✅ OK
4. Aparece botón **"Ver"** para visualizar

## Características

### Auto-Mayúsculas en Código IQ
```
Usuario escribe: col010
Sistema guarda: COL010
```

### Stock Entero
- Solo acepta números enteros (1, 2, 3...)
- No permite decimales (1.5 ❌)

### Validaciones
- Código IQ único (no duplicados)
- Campos obligatorios marcados con *
- Formato de precios correcto

## Después de Inventariar

### Botón "Ver"
- Muestra modal de solo lectura
- Información completa del producto
- Código QR generado
- No permite editar

### Estado del Item
- Cambia de "⏳ Pendiente" a "✅ OK"
- Se vincula con el producto creado
- Mantiene trazabilidad

## Integración

### Tabla: `productos_externos`
El producto se guarda en esta tabla con:
- `codigo_usuario`: Código IQ
- `nombre`: Nombre del producto
- `categoria`: ID del tipo de producto
- `costo`: Costo de compra
- `precio`: Precio de venta
- `stock_actual`: Stock inicial
- `stock_minimo`: Alerta de stock
- `imagen_url`: URL de la imagen
- `origen`: 'COMPRA'

### Tabla: `compras_items`
El item se actualiza con:
- `inventariado`: TRUE
- `producto_externo_id`: ID del producto creado

## Ejemplo Práctico

### Compra de Collares

1. **Registro de Compra**:
   - Proveedor: Joyería Lima
   - Item: "Collares buzios"
   - Cantidad: 5
   - Costo unitario: S/ 2.00

2. **Inventariar**:
   - Código IQ: COL010 (auto-mayúsculas)
   - Categoría: COLLAR
   - Precio: S/ 10.00
   - Stock Mínimo: 2

3. **Resultado**:
   - Producto creado en inventario
   - 5 unidades disponibles
   - Listo para vender

## Solución de Problemas

### Error: "Código duplicado"
**Causa:** Ya existe un producto con ese código  
**Solución:** Usar un código diferente

### No aparecen categorías
**Causa:** No hay tipos de producto creados  
**Solución:** Ir a Configuración → Tipos de Producto y crear

### Imagen no se carga
**Causa:** Archivo muy grande o formato no soportado  
**Solución:** Usar imagen < 5MB en formato JPG/PNG

## Mejores Prácticas

1. **Códigos consistentes**: Usar prefijos por categoría (COL, PUL, ARE, etc.)
2. **Precios realistas**: Considerar margen de ganancia
3. **Stock mínimo**: Configurar alertas apropiadas
4. **Descripciones**: Agregar detalles relevantes

## Ventajas

✅ **Rapidez**: Pre-llenado automático ahorra tiempo  
✅ **Precisión**: Reduce errores de transcripción  
✅ **Trazabilidad**: Vincula compra con inventario  
✅ **Simplicidad**: Interfaz intuitiva y limpia

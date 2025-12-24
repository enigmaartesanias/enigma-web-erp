# Wiki - Gestión de Tipos de Producto

## Descripción General

El módulo de Gestión de Tipos de Producto permite administrar las categorías de productos (ANILLO, ARETE, COLLAR, PULSERA, etc.) desde la sección de Configuración del ERP.

## Ubicación

**Ruta**: Configuración → Tipos de Producto  
**URL**: `/configuracion/tipos-producto`

## Funcionalidades

### 1. Agregar Nuevo Tipo

1. Escribir el nombre del tipo en el campo de texto
2. Click en botón "Agregar"
3. El tipo se guarda automáticamente en mayúsculas

**Validaciones:**
- Nombre obligatorio
- Mínimo 3 caracteres
- No permite duplicados

### 2. Editar Tipo Existente

1. Click en icono ✏️ (editar) del tipo deseado
2. El campo se vuelve editable
3. Modificar el nombre
4. Click en ✅ para guardar o ❌ para cancelar

### 3. Eliminar Tipo

1. Click en icono 🗑️ (eliminar)
2. Confirmar la eliminación en el diálogo
3. El tipo se elimina si no está en uso

**Nota:** No se pueden eliminar tipos que estén siendo utilizados en productos existentes.

## Integración con Formularios

Los tipos de producto se actualizan automáticamente en:

- Modal de Inventariar (Reporte de Compras)
- Formulario de Productos
- Formulario de Producción
- Cualquier otro formulario que use categorías

**No requiere:**
- Reiniciar la aplicación
- Recargar la página
- Modificar código

## Estructura de Datos

### Tabla: `tipos_producto`

| Campo  | Tipo         | Descripción                    |
|--------|--------------|--------------------------------|
| id     | SERIAL       | ID único autoincremental       |
| nombre | VARCHAR(50)  | Nombre del tipo (MAYÚSCULAS)   |

### API Client: `tiposProductoDB.js`

**Métodos disponibles:**

```javascript
// Obtener todos los tipos
await tiposProductoDB.getAll();

// Crear nuevo tipo
await tiposProductoDB.create(nombre);

// Actualizar tipo existente
await tiposProductoDB.update(id, nombre);

// Eliminar tipo
await tiposProductoDB.delete(id);
```

## Ejemplos de Uso

### Agregar "TIARA"

1. Ir a Configuración → Tipos de Producto
2. Escribir "tiara" (se convierte automáticamente a "TIARA")
3. Click en "Agregar"
4. Ahora "TIARA" aparece en todos los desplegables

### Editar "PULSERA" a "BRAZALETE"

1. Click en ✏️ junto a "PULSERA"
2. Cambiar a "BRAZALETE"
3. Click en ✅
4. Actualizado en todos los formularios

## Casos de Uso Comunes

### Joyería
- ANILLO
- ARETE
- COLLAR
- PULSERA
- DIJE
- CADENA
- TOBILLERA

### Accesorios
- TIARA
- BROCHE
- GEMELOS
- LLAVERO
- ADORNO

## Solución de Problemas

### No puedo eliminar un tipo
**Causa:** El tipo está siendo usado en productos existentes  
**Solución:** Primero cambiar la categoría de esos productos

### El tipo no aparece en los formularios
**Causa:** Error de conexión a base de datos  
**Solución:** Verificar conexión y recargar la página

### Aparece error de duplicado
**Causa:** Ya existe un tipo con ese nombre  
**Solución:** Usar un nombre diferente o editar el existente

## Mejores Prácticas

1. **Nombres descriptivos**: Usar nombres claros y específicos
2. **Consistencia**: Mantener nomenclatura uniforme
3. **Planificación**: Definir tipos antes de crear muchos productos
4. **Limpieza**: Eliminar tipos obsoletos que no se usan

## Seguridad

- Solo usuarios autenticados pueden acceder
- Validación en frontend y backend
- Prevención de inyección SQL
- Confirmación antes de eliminar

## Rendimiento

- Carga instantánea (< 100ms)
- Sin paginación necesaria (pocos registros)
- Actualización en tiempo real
- Sin caché (siempre datos frescos)

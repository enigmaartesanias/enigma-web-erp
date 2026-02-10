# Documentación Técnica: Optimización de Flujo de Producción y Notificaciones

Este documento explica los cambios realizados en el sistema ERP de Enigma, enfocándose en la resolución de errores de integridad de datos y la mejora de la experiencia de usuario (UX) mediante componentes reactivos.

---

## 1. Resolución del Bug: Duplicidad en Producción
**Problema:** Cuando un pedido contenía varios productos diferentes (ej. una Tiara y una Vincha), al pasarlos a producción, el sistema grababa el mismo producto repetido N veces. Esto ocurría porque la función de creación tomaba los datos generales del "encabezado" del pedido en lugar de los detalles específicos de cada artículo.

### Cambios en el Backend (Lógica de Datos)
En `src/utils/produccionNeonClient.js`, se refactorizó la función `createFromPedido`:

```javascript
async createFromPedido(pedidoId, data = {}) {
  // Ahora la función recibe un objeto 'data' con detalles específicos
  const metal = data.metal || pedido.metal || 'Plata';
  const tipo_producto = data.tipo_producto || pedido.tipo_producto || 'Anillo';
  
  // Construimos un nombre descriptivo único para el registro de taller
  const nombre_producto = data.nombre_producto || 
    `${tipo_producto} - Pedido #${pedidoId}`;

  // Inserción en la base de datos con los valores específicos del item
  const [produccion] = await sql`
    INSERT INTO produccion_taller (...) 
    VALUES (..., ${metal}, ${tipo_producto}, ${nombre_producto}, ...)
  `;
}
```

### Cambios en el Frontend (Lógica de Interfaz)
En `src/components/Pedidos.jsx`, se modificó el iterador de producción:

```javascript
// Antes: Se llamaba a la base de datos sin pasar detalles del producto
// Ahora: Iteramos el arreglo de detalles y pasamos cada propiedad
for (const detalle of pedido.detalles_pedido) {
    await produccionDB.createFromPedido(pedido.id_pedido, {
        cantidad: detalle.cantidad,
        metal: detalle.metal,
        tipo_producto: detalle.tipo_producto,
        nombre_producto: `${detalle.tipo_producto} - ${detalle.metal}` 
    });
}
```

**Explicación para estudiantes:** 
En bases de datos, esto se llama respetar la **Cardinalidad**. Un Pedido (1) tiene muchos Detalles (N). Si ignoramos el contenido del detalle al crear registros derivados, perdemos información. La solución fue "mapear" el arreglo de detalles para que cada uno genere su propio registro único en producción.

---

## 2. Nuevo Componente: StatusPopup (Notificaciones Inteligentes)
Se creó un componente sutil y premium para avisar al administrador sobre el estado del negocio al entrar al panel de inventario.

### Características del Código:
*   **Encapsulamiento de Lógica:** El componente es autónomo; él mismo consulta a la base de datos y decide si debe mostrarse o no.
*   **Hooks de React:**
    *   `useState`: Controla la visibilidad y los contadores.
    *   `useEffect`: Ejecuta la consulta (`fetchStatus`) al montar el componente.
*   **Filtrado de Datos:** La lógica de conteo es idéntica a la del componente principal para mantener la "única fuente de verdad".

```javascript
const pendingCount = pedidos.filter(p => 
    p.estado_pedido !== 'entregado' && 
    p.estado_produccion !== 'terminado' && 
    p.estado_produccion !== 'en_proceso'
).length;
```

### Estética Premium (UI/UX):
*   **Aero-glass y Blur:** Usa `backdrop-blur` para un efecto de vidrio esmerilado.
*   **Animaciones:** Emplea Keyframes de CSS (`fadeIn` y `scaleIn`) para una entrada suave.
*   **Diseño Zen:** Tipografía en mayúsculas con espaciado (`tracking-widest`) y colores sobrios (Slate, Amber, Blue).

---

## 3. Integración y Limpieza
En `InventarioHome.jsx`, se eliminó el antiguo sistema de alertas (`SubtleAlert`) y se integró el `StatusPopup`. 

**Lección de Refactorización:** 
Menos es más. Al mover la lógica de alertas a su propio componente (`StatusPopup`), el archivo principal del Home quedó más limpio y fácil de mantener. Esto sigue el principio de **Responsabilidad Única**.

---

## Conceptos clave para recordar:
1.  **Mapeo de Datos:** Siempre que trabajes con listas (arrays), asegúrate de usar los datos del elemento individual, no del contenedor global.
2.  **Feedback Visual:** Un sistema que "habla" con el usuario (popups de estado) reduce la carga cognitiva, ya que el usuario no tiene que buscar qué falta por hacer; el sistema se lo dice.
3.  **Transiciones:** En la web moderna, las cosas no deben "aparecer" de golpe. El uso de `setTimeout` y animaciones CSS crea una sensación de mayor calidad técnica.

---
*Documento generado para el equipo de desarrollo de Enigma Artesanías.*

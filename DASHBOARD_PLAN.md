# Plan de Mejora: Dashboard Enigma ERP (Responsive Zen)

Para resolver la confusión en móviles donde los elementos parecen mezclarse, implementaremos un sistema de **"Capas y Contraste"**. La clave es separar las tarjetas del fondo para que el ojo identifique cada módulo como una unidad independiente.

## 🛠️ Acciones Técnicas

### 1. Sistema de Contraste (Fondo vs Tarjeta)
*   **Problema:** Tarjetas blancas sobre fondo blanco se pierden.
*   **Solución:** Cambiar el fondo general a `bg-[#F8F9FA]` (gris neutral muy claro) y mantener las tarjetas en `bg-white`.
*   **Resultado:** Las tarjetas "flotan", creando una separación inmediata.

### 2. Definición de Bordes y Sombras Sutiles
*   **Cambio:** Sustituir `border-gray-100` por `border-gray-200/60` para mayor definición.
*   **Adición:** Añadir una sombra ultra-sutil: `shadow-[0_2px_8px_rgba(0,0,0,0.02)]`.

### 3. Aire y Jerarquía (Espaciado)
*   **Móvil:** Aumentar el `gap` entre tarjetas de `6` a `8`.
*   **Interno:** Añadir un `margin-bottom` sutil al Header de la tarjeta para despegarlo del cuerpo de acciones.

### 4. Refuerzo Visual de Acciones
*   El área de "Consulta" tendrá un fondo `bg-gray-50/20` casi imperceptible para diferenciarla de la acción principal.

---

## 📐 Mockup Estructural (Mobile View)

| Componente | Estilo Zen / Responsive |
| :--- | :--- |
| **Fondo Pantalla** | `bg-neutral-50` (Aporta profundidad) |
| **Contenedor Tarjeta** | `bg-white`, `rounded-md`, `border-gray-200` |
| **Sombra** | `shadow-sm` (Muy ligera) |
| **Separación (Gap)** | `gap-y-8` (Evita que los títulos se junten) |

---

## 📅 Hoja de Ruta
1.  **Iteración 1:** Cambiar colores de fondo y bordes.
2.  **Iteración 2:** Ajustar márgenes y gaps responsivos.
3.  **Iteración 3:** Pulir tipografía y alineación de iconos.

> **Nota:** Generaré la implementación exacta en el código una vez aprobado este plan.

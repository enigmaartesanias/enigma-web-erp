# Documentación: Actualización de Abril - QR y Producción

Este documento detalla las mejoras implementadas en los módulos de Producción y Catálogo de etiquetas QR para optimizar el flujo operativo y la legibilidad en dispositivos móviles.

## 1. Módulo de Producción (Taller)

### Mejoras de Registro
- **Fechador Manual**: Se integró un selector de fecha (`FaCalendarAlt`) para permitir el registro de stock antiguo con su fecha real de fabricación, manteniendo el orden contable mensual.
- **Complejidad de Trabajo**: Nuevo selector de complejidad (Media/Alta) para estandarizar registros.
- **Precio Sugerido Referencial**: Cálculo automático (`Costo x 2.5`) que sirve de guía para el margen comercial sin afectar el inventario.

### Optimización de Interfaz (UI/UX)
- **Modo Minimalista**: Reducción de fuentes a `11px` y eliminación de negritas en etiquetas de costos para máxima legibilidad en móviles.
- **Reordenamiento de Reporte**: La pestaña de **"📋 Registros (Todos)"** ahora es la primera en aparecer, seguida de "Producción" y "Terminados".
- **Visibilidad Mejorada**: Etiquetas de pestañas siempre visibles en móviles (sin `hidden`).

## 2. Catálogo de Etiquetas QR

### Sistema de Impresión Masiva
- **Selección por Categorías**: Implementación de botones de filtrado rápido (ARETES, ANILLOS, etc.) para organizar el catálogo de selección.
- **Impresión por Lotes**: Función para seleccionar múltiples productos y definir una cantidad específica de etiquetas por cada uno.
- **Layout de Precisión A4**:
    - Rejilla exacta de **3.5cm x 3.5cm** para cartones de 4x4.
    - Bordes punteados (`dashed`) para facilitar el recorte manual.
    - **Etiquetas de Referencia**: Cada grupo de QRs comienza con una etiqueta informativa (Foto + Nombre) para evitar confusiones al cortar.

### Optimización de Hardware y Enfoque
- **Calidad de Impresión**: Nivel de corrección de errores ajustado a **'L' (Low)** para obtener puntos más gruesos, ideales para impresoras térmicas.
- **Asistente de Enfoque**: Escalado visual de **1.2x** en la cámara del escáner para forzar la distancia focal óptima del celular.
- **Procesamiento Eficiente**: Optimización del área de interés de `jsQR` al 70% central de la imagen.

---
*Ultima actualización: 18 de Abril, 2026*

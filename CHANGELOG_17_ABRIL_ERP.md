# Changelog - 17 de Abril 2026 (ERP y Cotizador Autor)

A continuación se detallan los últimos cambios guardados en GitHub para esta iteración de la plataforma:

## 1. Cotizador de Autor (Herramienta Interna)
*   **Creación del Módulo (`CotizadorAutor.jsx`):** Se desarrolló un calculador de cotización especializado y súper rápido para joyería.
*   **Diseño Minimalista en Modal:** En lugar del voucher A4 tradicional, ahora se abre un pop-up minimalista y sofisticado. Se quitó todo formato agresivo para enfocarse en la pureza de la marca y las especificaciones para el cliente ("Joyería de Autor", "Total Inversión", Sin condiciones invasivas).
*   **Funciones de Escalabilidad:** Agregada la lógica "Hombre Orquesta" con variables exclusivas del código. Multiplicador de margen (x 2.5), fondos de seguridad como alquiler (10%), y cálculos ocultos para reposición (10% merma) sugeridos en la pantalla del orfebre antes de generar el costo final hacia el cliente.

## 2. Refinamiento Responsive (Voucher de Pedidos)
*   **Limpieza de Comprobantes (`Pedidos.jsx`):** Se re-arreglaron los espacios logísticos. Se retiraron estampados masivos que decían "PAGADO" a mitad del componente, permitiendo visualizar los abonos tranquilamente.
*   **Acciones Táctiles en Celular (`Tooltip.jsx`):** Se forzó a los cuadros de descripción flotante (tooltips) a cerrarse inmediatamente después de hacer un click o *touch* en los botones de operación, solucionando una obstrucción que había en el móvil para visualizar los campos inferiores. 

## 3. Reposicionamiento en Navegación y Vistas VIP
*   **Reorganización del Panel (`InventarioHome.jsx`):** El Cotizador fue movido desde las ventas regulares y el Almacén, hasta una categoría apartada denominada "ATENCIÓN Y VENTAS VIP" en el orden del bloque logístico final.
*   **Enfoque Pleno (`App.jsx`):** La ruta `/cotizador` quedó registrada como una tarea aislada sin distracciones (se oculta el Header y Footer principal al usarla).

## 4. "Logo Trigger" (Botón de Acceso Secreto Creado)
*   **Accionador de Seguridad (`Header.jsx`):** Ocultamos la puerta trasera al ERP. Desde cualquier dispositivo, presionar 2.5 segundos el logo público de la "Enigma" activa un *Long Press* que te dirige automáticamente a la ruta privada de administración.
*   **Mejoras Touch:** Se deshabilitó el menú nativo del dispositivo (típico menú de "Descargar" al mantener presionado) para que nadie sospeche de la animación fluida y el control exclusivo.

## 5. Prevención de Construcción Innecesaria
*   En esta actualización se añade el sufijo preventivo en Github para evitar un colapso en **Netlify** o conteos de minutos de compilación excesiva.

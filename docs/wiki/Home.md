# Wiki - Sistema ERP Aldo Artesanías

Bienvenido a la documentación completa del sistema ERP de Aldo Artesanías.

## 📚 Índice de Contenidos

### Guías de Usuario
- [Módulo de Ventas](./Modulo-de-Ventas.md)
- [Módulo de Inventario](./Modulo-de-Inventario.md)
- [Módulo de Producción](./Modulo-de-Produccion.md)
- [Módulo de Pedidos](./Modulo-de-Pedidos.md)
- [Módulo de Compras](./Modulo-de-Compras.md)
- [Módulo de Materiales](./Modulo-de-Materiales.md)

### Guías Técnicas
- [Instalación y Configuración](./Instalacion.md)
- [Estructura del Proyecto](./Estructura.md)
- [Base de Datos](./Base-de-Datos.md)
- [Despliegue](./Despliegue.md)
- [Google Analytics](./Google-Analytics.md)

### Referencia
- [API Reference](./API-Reference.md)
- [Componentes](./Componentes.md)
- [Utilidades](./Utilidades.md)

## 🚀 Inicio Rápido

### Para Usuarios
1. Accede a [https://aldoartesanias.web.app](https://aldoartesanias.web.app)
2. Inicia sesión con tus credenciales
3. Explora el panel de administración

### Para Desarrolladores
```bash
git clone https://github.com/enigmaartesanias/noviembre2025.git
cd noviembre2025
npm install
npm run dev
```

## 📖 Novedades

### Enero 2026 - v2.8.0 ✨

#### POS UI Redesign & UX Elegance
- 🎨 **Rediseño Minimalista**: Nueva interfaz "Light Style" con enfoque mobile-first y paleta de colores curada.
- 📱 **UX Mobile**: Lista de productos integrada en el resumen para dispositivos táctiles.
- 💳 **Pagos Simplificados**: Selector visual de 3 opciones (Efectivo, Digital, Crédito) con iconos minimalistas.
- 🛠️ **Refinamiento UX**: Arreglo de bugs visuales (overlap de símbolos) y estabilidad en la selección de clientes.

### Enero 2026 - v2.6.0
 
#### Flujo de Pedidos 2.0 💸
- 💳 **Pagos Flexibles**: Registro de pagos en cualquier estado, cobro post-entrega y botón de pago omnipresente.
- 🚚 **Entregas Seguras**: Restricción de entregas solo a pedidos "Listos" para evitar errores operativos.
- 👁️ **UX Mejorada**: Novedades visuales en botones de acción y reporte integrado.

### Enero 2026 - v2.2.0

#### Migración a Neon DB y Mejoras en Pedidos
- 🚀 **Base de datos unificada**: Pedidos ahora opera 100% en Neon DB
- ✨ **Flujo de Entrega**: Nueva distinción entre "Terminado" (taller) y "Entregado" (cliente)
- 🎨 **Nota de Pedido**: Rediseño visual para mayor claridad y formato compacto
- 🛡️ **Seguridad**: Bloqueo de edición en historial de entregas

### Diciembre 2024 - v2.0.0

#### Sistema de Ventas Mejorado
- ✅ **Pestañas VENTAS/ANULADAS**: Separación visual clara
- ✅ **Código correlativo**: 0001, 0002, 0003... (profesional)
- ✅ **Fecha compacta**: DD/MM/YY sin hora
- ✅ **Responsive optimizado**: Tabla adaptativa para móviles
- ✅ **Filtros compactos**: 2 columnas, diseño minimalista

#### Google Analytics Integrado
- ✅ Inicialización automática en producción
- ✅ Manejo de errores robusto
- ✅ Listo para eventos personalizados

## 🎯 Características Destacadas

### Anulación de Ventas Profesional
El sistema implementa las mejores prácticas de ERPs empresariales:

- **No se eliminan registros**: Trazabilidad completa
- **Reversión automática de stock**: Al anular, el inventario se restaura
- **Exclusión de totales**: Las ventas anuladas no afectan reportes financieros
- **Motivo obligatorio**: Se registra el motivo de cada anulación
- **Separación visual**: Pestañas independientes para ventas activas y anuladas

### Código de Venta Correlativo
Sistema de numeración profesional:

- **Formato**: 0001, 0002, 0003, etc.
- **Automático**: Consulta el último código y genera el siguiente
- **4 dígitos**: Con ceros a la izquierda
- **Compatible**: Funciona con ventas antiguas (formato V-timestamp)

## 🔧 Tecnologías

- **React 18** - Framework de UI
- **Vite 5** - Build tool
- **Neon PostgreSQL** - Base de datos serverless
- **Firebase** - Hosting, Storage, Analytics
- **Tailwind CSS** - Estilos
- **React Router 6** - Navegación

## 📞 Soporte

¿Necesitas ayuda? Consulta:
- [Preguntas Frecuentes](./FAQ.md)
- [Solución de Problemas](./Troubleshooting.md)
- Email: soporte@aldoartesanias.com

---

**Última actualización**: Enero 2026

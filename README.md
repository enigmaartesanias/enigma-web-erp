# Enigma Sistema ERP

> Sistema ERP completo para gestión de joyería artesanal peruana

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://aldoartesanias.web.app)
[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![Framework](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)

**🔗 Demo en vivo**: [https://aldoartesanias.web.app](https://aldoartesanias.web.app)

---

## 📋 Descripción

Sistema ERP minimalista y profesional diseñado específicamente para Enigma Artesanías. Gestiona el ciclo completo de operaciones: pedidos, producción, inventario, ventas y compras con interfaz mobile-first y diseño de nivel comercial.

---

## ✨ Características Principales

### 🛒 Operación Diaria
- **Ventas**: Registro rápido con descuento de inventario automático
- **Pedidos**: Control completo con estados y gestión de pagos
- **Inventario**: Gestión dual (productos propios + externos)
- **Compras**: Sistema inteligente para materiales y productos

### 🔨 Producción
- **Gestión de Taller**: Seguimiento de producción con costos
- **Dos Tipos**: Stock general o pedidos específicos
- **Estados**: En proceso → Terminado
- **Reportes**: Métricas y análisis de costos

### 📊 Reportes y Análisis
- **Ventas**: Estadísticas con filtros y anulación con reversión
- **Compras**: Historial diferenciado (materiales vs productos)
- **Inventario**: Stock en tiempo real con alertas
- **Pedidos**: Análisis completo con estados

### ⚙️ Configuración
- **Clientes**: Base de datos de clientes
- **Stock Inicial**: Carga masiva de inventario
- **Códigos QR**: Generación de etiquetas

---

## 🎨 Diseño

### Filosofía Minimalista
- **Solo escala de grises**: Sin colores brillantes innecesarios
- **Mobile-first**: Optimizado para uso con pulgar (touch targets 88-106px)
- **Iconografía consistente**: Todas las secciones con íconos sutiles
- **Contexto inteligente**: Subtítulos informativos (ej: "solo lectura")

### Priorización Visual
```
1️⃣ OPERACIÓN DIARIA (lo más usado)
2️⃣ PRODUCCIÓN (taller)
3️⃣ REPORTES (análisis)
4️⃣ CONFIGURACIÓN (datos maestros)
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - UI library
- **React Router** - Navegación
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Styling utility-first
- **Lucide React** - Iconos modernos

### Backend & Database
- **Neon DB** (PostgreSQL serverless)
- **Supabase** (alternativo, migración parcial)

### Storage & Deploy
- **Firebase Storage** - Imágenes de productos
- **Firebase Hosting** - Deploy automático
- **PWA** - Instalable como app

### Notificaciones
- **react-hot-toast** - Mensajes elegantes
- **Modales custom** - Confirmaciones UX

---

## 🚀 Instalación y Uso

### Requisitos Previos
```bash
Node.js >= 18
npm >= 9
```

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/enigmaartesanias/noviembre2025.git
cd noviembre2025

# Instalar dependencias
npm install
```

### Variables de Entorno
Crear archivo `.env` con:
```env
VITE_DATABASE_URL=postgresql://...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

### Desarrollo
```bash
npm run dev
# Abre http://localhost:5173
```

### Build Producción
```bash
npm run build
firebase deploy --only hosting
```

---

## 📦 Módulos Implementados

### 1. Sistema de Compras
**Dual-purpose**: Maneja materiales/insumos Y productos para reventa

**Características**:
- ✅ Formulario inteligente que se adapta al tipo
- ✅ Materiales: Solo registro, no afecta inventario
- ✅ Productos: Crea automáticamente en `productos_externos`
- ✅ Upload de imágenes con compresión
- ✅ Generación de códigos únicos (CMP-YYYYMMDD-XXX)
- ✅ Reporte con filtros y estadísticas

**Archivos**:
- `utils/comprasClient.js` - CRUD + helpers
- `modules/compras/pages/RegistroCompras.jsx` - Formulario
- `modules/compras/pages/ReporteCompras.jsx` - Reporte

### 2. Sistema de Ventas
**MVP funcional** con anulación inteligente

**Características**:
- ✅ Buscador de productos en tiempo real
- ✅ Descuento automático de inventario
- ✅ Cálculo de IGV y totales
- ✅ Anulación con reversión de stock
- ✅ Estados: Activa/Anulada

### 3. Sistema de Pedidos
**Control completo** del flujo

**Características**:
- ✅ Registro manual de pedidos
- ✅ Estados: Pendiente → En Producción → Entregado
- ✅ Gestión de pagos y saldos
- ✅ Creación de producción desde pedido
- ✅ Validación de estado antes de entregar

### 4. Sistema de Producción
**Taller digital**

**Características**:
- ✅ Dos tipos: Stock o Pedido específico
- ✅ Costos detallados (materiales + mano de obra)
- ✅ Upload de imagen al terminar
- ✅ Auto-creación en inventario (solo tipo Stock)
- ✅ Reportes de métricas

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

**productos_externos**
- Productos comprados para reventa
- `origen`: COMPRA | MANUAL

**produccion**
- Registro de taller
- `tipo_produccion`: STOCK | PEDIDO

**pedidos** + **detalles_pedido**
- Pedidos de clientes
- Relación con producción

**ventas**
- Registro de ventas
- `estado`: ACTIVA | ANULADA

**compras**
- Registro de compras
- `tipo_compra`: MATERIAL | PRODUCTO

---

## 📱 Características Responsive

### Mobile (375px)
- 1 columna vertical
- Touch targets grandes (88-106px)
- Operación diaria arriba
- Scroll natural

### Tablet (768px)
- 2 columnas en secciones principales
- Mismo estilo compacto

### Desktop (1024px+)
- Grid adaptativo por sección
- Máximo 2-4 columnas según contexto

---

## 🎯 Mejoras Recientes

### v2.1.0 - Sistema de Alertas + Optimización Responsive (Diciembre 2025)
- ✅ **Sistema de Alertas Minimalista**: Notificaciones sutiles para pedidos pendientes/atrasados
- ✅ **Reporte de Producción Responsive**: Optimización completa para móvil
  - Pestañas compactas con scroll horizontal
  - Headers sticky con scroll vertical
  - Título dinámico del filtro activo (solo móvil)
  - Formato de fecha compacto (DD/MM/YY)
  - Columna producto con line-clamp-3
  - Valores monetarios en gris uniforme
- ✅ **Hook useAlerts**: Verificación automática de pedidos críticos
- ✅ **Componente SubtleAlert**: Mensajes auto-dismiss sin intrusión

### v2.0.0 - Rediseño Minimalista (Diciembre 2025)
- ✅ Panel ERP completamente rediseñado
- ✅ Paleta monocromática profesional
- ✅ Iconos en todos los títulos de sección
- ✅ Compactación optimizada (padding -15%)
- ✅ Sección Reportes diferenciada (fondo gris + subtítulo)
- ✅ Mobile-first real (106px cards)

### Sistema de Compras (Diciembre 2025)
- ✅ Implementación completa dual-purpose
- ✅ Corrección de errores de imports y tipos SQL
- ✅ Integración automática con inventario

### Mensajería Elegante (Diciembre 2025)
- ✅ Eliminación de `window.confirm` y `alert`
- ✅ Modales personalizados
- ✅ Tooltips en todas las acciones
- ✅ Toast notifications profesionales

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Módulos principales** | 8 |
| **Componentes React** | 25+ |
| **Tablas DB** | 7 |
| **Líneas de código** | ~8,000 |
| **Build size** | ~638 KB |
| **Lighthouse Score** | 95+ |

---

## 🔐 Seguridad

- Variables de entorno para credenciales
- `.env` en `.gitignore`
- Validación client-side y server-side
- Imágenes optimizadas antes de upload
- Neon DB con SSL

---

## 🤝 Contribución

Este es un proyecto privado para Enigma Artesanías. Para consultas:
- Email: contacto@enigmaartesanias.com

---

## 📝 Licencia

Copyright © 2025 Enigma Artesanías. Todos los derechos reservados.

---

## 🙏 Agradecimientos

Desarrollado con ❤️ para optimizar la gestión de joyería artesanal peruana.

**Stack moderno** + **Diseño profesional** + **UX intuitiva** = **ERP de nivel comercial**

---

**Última actualización**: Diciembre 2025  
**Deploy URL**: https://aldoartesanias.web.app

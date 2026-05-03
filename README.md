# 🏺 Enigma Web & ERP

> **Sistema integral de gestión y tienda en línea para Artesanías Enigma**
> — donde la orfebrería artesanal se encuentra con el desarrollo web moderno.

Creado y mantenido por **Aldo Magallanes** — Artesano Goldsmith & Desarrollador Web Fullstack

[![Deploy](https://img.shields.io/badge/web-artesaniasenigma.com-black?style=flat-square&logo=firefox)](http://www.artesaniasenigma.com)
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Neon-blue?style=flat-square)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-Privado-red?style=flat-square)](#licencia)

---

## ¿Qué es este proyecto?

Enigma nació como un taller artesanal de joyería en Lima, Perú. Este sistema es la respuesta digital a una necesidad real: **gestionar producción, ventas, pedidos e inventario de un negocio artesanal sin depender de software genérico**.

No es un template. Es un ERP construido desde cero para un rubro específico, con lógica de negocio real: trazabilidad de metales, costos por lote de producción, punto de equilibrio mensual, y flujo completo desde el pedido del cliente hasta la entrega.

---

## 🌐 Web Pública — [artesaniasenigma.com](http://www.artesaniasenigma.com)

Tienda y catálogo público construido con React + Vite + Supabase.

- Catálogo dinámico con galerías, categorías y novedades
- Integración WhatsApp con contexto del producto consultado
- Diseño responsive optimizado para móvil y escritorio
- Panel de administración seguro para gestión de contenido
- Entorno de staging espejo en Netlify para pruebas

---

## 🖥️ ERP Interno — Gestión del Negocio

Infraestructura: **Neon PostgreSQL + Firebase Storage**

Sistema modular diseñado para talleres artesanales que buscan profesionalizar su operación sin perder la escala humana del negocio.

### Módulos

| Módulo | Descripción |
|--------|-------------|
| 💰 **Ventas** | Registro transaccional, anulación con reversión automática de stock, créditos y estadísticas |
| 📦 **Pedidos** | Flujo completo de estados: pendiente → producción → terminado → entregado |
| 🛠️ **Producción** | Órdenes de taller, trazabilidad de materiales por metal, envío a stock |
| 📊 **Inventario** | Control en tiempo real con Códigos QR, historial de movimientos y etiquetas imprimibles |
| 🛒 **Compras** | Gestión de proveedores y costos de insumos (plata, cobre, alpaca, bronce) |
| 📈 **Finanzas** | Rentabilidad real, gestión de deuda, gastos fijos/variables, punto de equilibrio y prorrateo de costos estructurales por volumen mensual |
| 🏷️ **Etiquetas QR** | Generación e impresión de etiquetas físicas por lote para identificación en punto de venta |

---

## 🚀 Stack Tecnológico

### Frontend
- **React 18 + Vite 5** — Fast Refresh y rendimiento optimizado
- **Tailwind CSS** — Sistema de diseño utilitario responsive
- **Recharts** — Visualización de datos financieros y de ventas
- **React Hot Toast** — Notificaciones de sistema no intrusivas

### Backend & Cloud
- **Supabase** — PostgreSQL + Auth para la web pública
- **Neon PostgreSQL** — Base de datos serverless para el ERP
- **Firebase Hosting & Storage** — Hosting y almacenamiento de imágenes
- **Netlify** — Staging y deploys de previsualización

### Herramientas
- **Google Analytics 4** — Métricas de la tienda pública
- **html2canvas + jsPDF** — Exportación de reportes en imagen y PDF
- **react-qr-code** — Generación de códigos QR para inventario

---

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- Cuentas activas en Firebase, Supabase y Neon DB

### Configuración

```bash
# Clonar el repositorio
git clone https://github.com/enigmaartesanias/enigma-web-erp.git

# Entrar al directorio
cd enigma-web-erp

# Instalar dependencias
npm install

# Iniciar entorno de desarrollo
npm run dev
```

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto con las siguientes claves:

```env
# Supabase (Web pública)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Neon PostgreSQL (ERP)
VITE_DATABASE_URL=

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

### Comandos

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
firebase deploy  # Despliegue a Firebase Hosting
```

---

## 🗂️ Estructura del Proyecto

```
src/
├── components/
│   ├── Ventas/          # Módulo de ventas y reportes
│   ├── Pedidos/         # Gestión de pedidos y estados
│   ├── Produccion/      # Control de taller y lotes
│   ├── Inventario/      # Stock y movimientos
│   ├── Finanzas/        # Reportes financieros
│   └── Reportes/        # Popularidad, QR, producción
├── utils/
│   ├── ventasClient.js
│   ├── pedidosNeonClient.js
│   ├── produccionNeonClient.js
│   └── ...
└── firebaseConfig.js
```

---

## 💡 Filosofía del Proyecto

Este sistema nació de una contradicción: los mejores softwares de gestión están pensados para empresas, no para talleres. Los talleres artesanales tienen lógica propia — lotes pequeños, costos variables por metal, producción por encargo, clientes recurrentes con historial informal.

Enigma ERP resuelve eso sin over-engineering. Cada módulo fue construido a partir de una necesidad operativa real, no de un requerimiento teórico. El resultado es un sistema que un artesano puede usar a diario sin formación técnica.

---

## 📄 Licencia y Propiedad

© 2025–2026 **Aldo Magallanes** — Artesanías Enigma, Lima, Perú.
Software privado y confidencial.
Prohibida su reproducción total o parcial sin autorización expresa del autor.

---

<div align="center">
  <sub>Hecho con 🔨 y código desde un taller en Lima</sub>
</div>

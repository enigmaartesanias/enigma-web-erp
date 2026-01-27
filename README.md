🛠️ ENIGMA SISTEMA ERP & E-commerce - Aldo Artesanías

Gestión integral de negocios artesanales + tienda en línea, desarrollado para optimizar el flujo desde el taller hasta el cliente final.
Disponible en: www.artesaniasenigma.com

Tecnologías: React + Vite + Firebase + Neon PostgreSQL

🌟 Por qué ENIGMA SISTEMA ERP es indispensable

Automatiza todo: ventas, pedidos, inventario, materiales y producción.

ERP + E-commerce integrados: todo en una sola plataforma, sin duplicar sistemas.

Pedidos por voz: ideal para talleres donde se necesita registro manos libres.

Optimización UX: flujos rápidos, confirmación visual y auditiva, responsive y mobile-first.

Control total: trazabilidad completa, reportes en tiempo real y gestión de stock confiable.

🛍️ E-commerce Público

Catálogo dinámico de productos por material y categoría (anillos, pulseras, collares…).

Carrusel de productos destacados y galería de imágenes.

Integración con WhatsApp para consultas instantáneas.

Multiidioma: Español/Inglés.

SEO optimizado con meta tags dinámicos.

📊 ERP Administrativo
Módulo de Ventas

Ventas / Anuladas con pestañas separadas.

Código correlativo automático (0001, 0002…).

Anulación profesional con reversión automática de stock.

Estadísticas en tiempo real, filtros de fecha compactos y responsive optimizado.

Módulo de Inventario

Productos con códigos QR únicos y stock en tiempo real.

Categorías dinámicas y carga de imágenes a Firebase Storage.

Reportes avanzados con historial de movimientos.

Módulo de Producción

Gestión por pedido o stock, estados En Proceso / Terminado.

Envío directo a inventario con pre-llenado de datos.

Trazabilidad completa y reportes de producción con métricas.

Módulo de Compras

Registro de compras y items pendientes/inventariados.

Modal de inventariar simplificado y edición inline de items.

Gestión de proveedores integrada con historial detallado.

Módulo de Materiales

Control de insumos y gastos de materias primas.

Reportes de costos con métricas claras para decisiones estratégicas.

Módulo de Pedidos por Voz (🚀 Pro UX)

Registro manos libres directamente en la base de datos Neon.

Flujo inteligente: Cliente → Productos → Envío → Pagos.

Confirmación UX: Modal de revisión con lectura automática del pedido antes de guardar.

Wake Lock API: Mantiene la pantalla activa durante dictados largos, ideal para talleres y almacenes.

Módulo de Configuración

Gestión de tipos de producto con CRUD completo y edición inline.

Actualización automática en todos los formularios y validación de duplicados.

Gestión completa de clientes y proveedores.

🚀 Tecnologías Clave

Frontend: React 18, Vite 5, React Router 6, Tailwind CSS, React Hot Toast, Recharts
Backend & Database: Neon PostgreSQL (serverless), Firebase Auth, Firebase Storage, Firebase Hosting
Analítica y UX: Google Analytics 4, Wake Lock API, Web Speech API
Herramientas de desarrollo: ESLint, Git, GitHub

📦 Instalación rápida

Prerrequisitos: Node.js 18+, Firebase y Neon Database.

git clone https://github.com/enigmaartesanias/noviembre2025.git
cd noviembre2025
npm install


Configura tus variables de entorno en .env:

# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Neon Database
VITE_DATABASE_URL=tu_neon_database_url


Ejecutar en desarrollo:

npm run dev


Construir para producción:

npm run build
firebase deploy

📁 Estructura del Proyecto
webagosto2025/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/            # Contextos de React (Auth, etc.)
│   ├── modules/             # Módulos del ERP
│   ├── pages/               # Páginas públicas
│   ├── utils/               # Utilidades y clientes de DB
│   ├── styles/              # Estilos globales
│   ├── firebaseConfig.js
│   └── App.jsx
├── scripts/                 # Scripts de migración DB
├── public/                  # Archivos estáticos
├── .env                     # Variables de entorno
└── package.json             # Dependencias

🎯 Funcionalidades Destacadas

Ventas y anulación con trazabilidad completa y reversión automática de stock.

Pedidos por voz con feedback visual y auditivo en tiempo real.

Inventario consolidado y actualizado en todo momento.

Reportes y métricas claros en dashboard minimalista y responsive.

UX adaptativa: silencios dinámicos, timeout extendido y mensajes motivadores.

Seguridad y estabilidad: Firebase Auth, HTTPS y validación de datos.

📄 Licencia

Privado y confidencial. Todos los derechos reservados © 2025 Aldo Artesanías.

Desarrollado con ❤️ para optimizar la gestión de artesanías, desde el taller hasta el cliente final en www.artesaniasenigma.com

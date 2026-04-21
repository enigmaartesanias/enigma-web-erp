🏺 Enigma Web & ERP
Creado por Aldo Magallanes – Artesano Goldsmith & Desarrollador Web Fullstack

Sistema integral de gestión y tienda en línea para Artesanías Enigma, que fusiona el arte de la orfebrería con la eficiencia del desarrollo web moderno. Este proyecto combina una web pública, un ERP interno de alta precisión y un entorno de despliegue profesional.


🌟 Componentes Principales
1️⃣ Web Pública - www.artesaniasenigma.com
✅ Arquitectura: Desarrollada desde cero con React + Vite + Supabase.

✅ Gestión de Catálogo: Carga dinámica de productos con galerías, categorías y sistema de novedades.

✅ Conversión: Botones de WhatsApp personalizados que mantienen el contexto del producto consultado.

✅ UX/UI: Diseño responsive optimizado para móviles y escritorio con panel de administración seguro.

✅ Staging: Entorno de pruebas espejo desplegado en Netlify.

2️⃣ ERP Interno - Gestión de Negocio
✅ Infraestructura: Potenciado por Neon PostgreSQL y Firebase Storage.

✅ Escalabilidad: Sistema modular diseñado para la transición de talleres físicos a entornos digitales.

Módulos principales: - 💰 Ventas: Registro transaccional, anulación con reversión de stock automática y estadísticas.

📦 Pedidos: Flujo completo de estados y control de entregas personalizadas.

🛠️ Producción: Seguimiento de órdenes de taller, trazabilidad de materiales y envío a stock.

📊 Inventario: Control en tiempo real mediante Códigos QR e historial de movimientos.

🛒 Compras e Insumos: Gestión de proveedores y costos de metales (plata, cobre, alpaca).

🚀 Tecnologías
Frontend & Visualización
React 18 & Vite 5 (Fast Refresh & Performance)

Tailwind CSS (Diseño moderno y ligero)

Recharts (Visualización de datos de ventas)

React Hot Toast (Notificaciones de sistema)

Backend & Cloud
🌐 Web: Supabase (PostgreSQL + Auth)

🖥️ ERP: Neon PostgreSQL (Serverless DB) / Firebase Storage

Hosting: Firebase Hosting & Netlify

Analytics: Google Analytics 4

📦 Instalación y Configuración
Prerrequisitos
Node.js 18+

Cuentas activas en Firebase, Supabase y Neon DB.

Configuración del Repositorio
Bash
# Clonar el proyecto
git clone https://github.com/enigmaartesanias/enigma-web-erp.git

# Entrar al directorio
cd enigma-web-erp

# Instalar dependencias
npm install
Variables de Entorno (.env)
Es fundamental configurar las API Keys de Firebase, Supabase y el DATABASE_URL de Neon para el funcionamiento de los módulos.

🛠️ Comandos de Desarrollo
Desarrollo: npm run dev

Producción: npm run build

Despliegue: firebase deploy

📄 Licencia y Propiedad
© 2005-2026 Aldo Magallanes - Artesanías Enigma. Software privado y confidencial. Prohibida su reproducción total o parcial sin autorización expresa del autor.

💡 Nota del Desarrollador
Este sistema es una solución real nacida de la necesidad de digitalizar un negocio artesanal. Está diseñado bajo una filosofía modular, permitiendo que cada componente pueda ser adaptado a otros emprendimientos que busquen profesionalizar su inventario y presencia online.

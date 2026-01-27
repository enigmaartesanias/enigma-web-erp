# 🏺 Aldo Artesanías - Web & ERP

Sistema integral de gestión y tienda en línea para **Artesanías Enigma**, desarrollado completamente por mí, combinando **web pública**, **ERP interno** y un **entorno de pruebas**.

---

## 🌟 Componentes Principales

### 1️⃣ Web Pública - www.artesaniasenigma.com
✅ Desarrollada y programada desde cero con **React + Vite + Supabase**  
✅ **Carga de productos** con imágenes, descripciones, categorías y novedades  
✅ **Carrusel** de productos destacados  
✅ **WhatsApp** personalizado por página/producto  
✅ **Google Maps** integrado en contacto  
✅ Diseño **responsive** para escritorio y móviles  
✅ Panel de control seguro para **administrar productos y contenido**  
✅ Clon de la web en **Netlify** para pruebas o demostraciones  
✅ Ideal para emprendedores que quieren mostrar y vender sus productos  

---

### 2️⃣ ERP Interno - Gestión de Negocio
✅ Desarrollado para uso personal con **Firebase Storage** y **Neon DB**  
✅ Modular y escalable, adaptable a otros emprendedores  
**Módulos principales:**  
- 💰 **Ventas:** registro, anulación profesional, estadísticas  
- 📦 **Pedidos:** flujo completo, control de entregas  
- 🛠️ **Producción:** orden, seguimiento, envío a inventario  
- 📊 **Inventario:** stock en tiempo real, código QR, historial de movimientos  
- 🛒 **Compras y Materiales:** gestión de proveedores, insumos y costos  
- ⚙️ **Configuración y Usuarios:** CRUD de tipos de productos, clientes y proveedores  

---

## 🚀 Tecnologías

### Frontend
- React 18, Vite 5  
- Tailwind CSS  
- React Router 6  
- React Hot Toast  
- Recharts (gráficos)  

### Backend & Base de Datos
- 🌐 **Web:** Supabase (BD + autenticación)  
- 🖥️ **ERP:** Neon PostgreSQL / Firebase Storage  
- Firebase Authentication  
- Firebase Hosting  
- Google Analytics 4  

### Herramientas de Desarrollo
- VSCode, ESLint, Git / GitHub  
- Google Antigravity (editor para pruebas)  
- Netlify (entorno de pruebas web)  

---

## 📦 Instalación / Desarrollo

### Prerrequisitos
- Node.js 18+ y npm  
- Cuenta de Firebase  
- Cuenta de Supabase  
- (Opcional) Neon DB para ERP  

### Pasos
```bash
git clone https://github.com/enigmaartesanias/noviembre2025.git
cd noviembre2025
npm install

Variables de Entorno
# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Supabase (Web)
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key

# Neon DB (ERP)
VITE_DATABASE_URL=tu_neon_url

Ejecutar en desarrollo
npm run dev

Construir para producción
npm run build

Desplegar en Firebase Hosting
firebase deploy

📝 Funcionalidades Destacadas
🌐 Web Pública

Productos con imágenes y carrusel

WhatsApp personalizado por producto

Panel de control para ingreso y edición rápida

Google Maps integrado

Responsive desktop / móvil

Clon en Netlify para pruebas

🖥️ ERP Interno

Ventas, pedidos, producción e inventario

Reversión automática de stock al anular ventas

Control de entregas y pagos

Historial de movimientos y trazabilidad

Modular y escalable

🔒 Seguridad

Autenticación con Firebase Auth / Supabase Auth

Variables de entorno para credenciales sensibles

Rutas privadas protegidas

HTTPS en producción

📄 Licencia

Privado y confidencial. Todos los derechos reservados © 2005-2026 Aldo Artesanías.

Nota: Estas soluciones son sistemas reales que uso en mi negocio, pensados para organizar, mostrar y vender productos.
Pueden adaptarse a otros emprendedores de manera modular según sus necesidades.

# 🏺 Aldo Artesanías - ERP & E-commerce Platform

Sistema integral de gestión empresarial (ERP) y tienda en línea para artesanías en plata, desarrollado con React + Vite y Firebase.

[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange?logo=firebase)](https://aldoartesanias.web.app)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Neon](https://img.shields.io/badge/Database-Neon-00E699?logo=postgresql)](https://neon.tech/)

## 🌟 Características Principales

### 🛍️ E-commerce (Tienda Pública)
- **Catálogo dinámico** de productos en plata
- **Filtros por material y categoría** (anillos, pulseras, collares, etc.)
- **Carrusel de imágenes** destacadas
- **Detalle de productos** con galería de imágenes
- **Integración con WhatsApp** para consultas
- **Multiidioma** (Español/Inglés)
- **SEO optimizado** con meta tags dinámicos

### 📊 ERP (Panel Administrativo)

#### Módulo de Ventas
- ✅ **Sistema de pestañas** VENTAS / ANULADAS
- ✅ **Código correlativo** automático (0001, 0002, etc.)
- ✅ **Anulación profesional** con reversión de stock
- ✅ **Formato de fecha compacto** (DD/MM/YY)
- ✅ **Responsive optimizado** para móviles
- ✅ **Estadísticas en tiempo real** (excluyen ventas anuladas)
- ✅ **Filtros de fecha** compactos
- ✅ **Gestión de clientes** integrada

#### Módulo de Inventario
- **Productos externos** con códigos QR únicos
- **Stock en tiempo real** con historial de movimientos
- **Categorías dinámicas** (Anillos, Pulseras, Collares, etc.)
- **Carga de imágenes** a Firebase Storage
- **Reportes de inventario** con filtros avanzados

#### Módulo de Producción
- **Gestión de producción** por pedido o stock
- **Estados de producción** (En Proceso, Terminado)
- **Envío directo a inventario** con pre-llenado de datos
- **Trazabilidad completa** de productos
- **Reportes de producción** con métricas

#### Módulo de Compras
- **Registro de compras** de productos para venta
- **Reporte de compras** con items pendientes/inventariados
- **Modal de inventariar** simplificado con pre-llenado automático
- **Edición inline** de items de compra
- **Modal de visualización** de productos inventariados
- **Gestión de proveedores** integrada
- **Historial de compras** con filtros por estado

#### Módulo de Materiales
- **Registro de gastos** en materias primas
- **Control de insumos** para producción
- **Reportes de costos** de materiales

#### Módulo de Pedidos (Refactorizado)
- **Registro optimizado** con selección de Tipo y Metal
- **Flujo de estados**: Pendiente -> Producción -> Terminado -> Entregado
- **Control de entregas**: Validación de saldos y registro de fecha de entrega
- **Nota de Pedido**: Diseño minimalista para impresión térmica
- **Historial de entregas**: Vista de solo lectura para pedidos pasados

#### Módulo de Configuración
- **Gestión de tipos de producto** (ANILLO, ARETE, COLLAR, etc.)
- **CRUD completo** con edición inline
- **Actualización automática** en todos los formularios
- **Validación de duplicados** y auto-mayúsculas
- **Gestión de clientes y proveedores**

#### 🎤 Sistema de Voz (Nuevo)
- **Registro por voz ultra-rápido** para datos personales.
- **Flujo silencioso**: El sistema avanza automáticamente sin repeticiones innecesarias.
- **Cierre preventivo**: El micrófono se apaga automáticamente al finalizar la Fase 1.
- **Privacidad y Precisión**: Diseñado para captura rápida con confirmación visual humana.

## 🚀 Tecnologías

### Frontend
- **React 18** - Biblioteca de UI
- **Vite 5** - Build tool ultrarrápido
- **React Router 6** - Enrutamiento SPA
- **Tailwind CSS** - Estilos utility-first
- **React Hot Toast** - Notificaciones elegantes
- **Recharts** - Gráficos y visualizaciones

### Backend & Database
- **Neon PostgreSQL** - Base de datos serverless
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Storage** - Almacenamiento de imágenes
- **Firebase Hosting** - Despliegue y hosting
- **Google Analytics 4** - Analítica web

### Herramientas de Desarrollo
- **ESLint** - Linter de código
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta de Firebase
- Cuenta de Neon Database

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/enigmaartesanias/noviembre2025.git
cd noviembre2025
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# Neon Database
VITE_DATABASE_URL=tu_neon_database_url
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

6. **Desplegar a Firebase**
```bash
firebase deploy
```

## 📁 Estructura del Proyecto

```
webagosto2025/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/            # Contextos de React (Auth, etc.)
│   ├── modules/             # Módulos del ERP
│   │   ├── ventas/          # Módulo de ventas
│   │   ├── inventario/      # Módulo de inventario
│   │   ├── compras/         # Módulo de compras
│   │   ├── materiales/      # Módulo de materiales
│   │   ├── configuracion/   # Módulo de configuración
│   │   ├── clientes/        # Gestión de clientes
│   │   └── proveedores/     # Gestión de proveedores
│   ├── pages/               # Páginas públicas
│   ├── utils/               # Utilidades y clientes de DB
│   ├── styles/              # Estilos globales
│   ├── firebaseConfig.js    # Configuración de Firebase
│   └── App.jsx              # Componente principal
├── scripts/                 # Scripts de migración de DB
├── public/                  # Archivos estáticos
├── .env                     # Variables de entorno (no versionado)
└── package.json             # Dependencias del proyecto
```

## 🎯 Funcionalidades Destacadas

### Sistema de Anulación de Ventas
- ✅ Las ventas anuladas **no se eliminan** (trazabilidad)
- ✅ **Reversión automática** de stock al anular
- ✅ **Exclusión de totales** financieros
- ✅ **Separación visual** con pestañas
- ✅ **Motivo de anulación** obligatorio

### Código de Venta Correlativo
- ✅ Formato profesional: `0001`, `0002`, `0003`...
- ✅ **Generación automática** consultando último código
- ✅ **Compatible** con ventas antiguas
- ✅ **4 dígitos** con ceros a la izquierda

### Google Analytics Integrado
- ✅ **Inicialización condicional** (solo en producción)
- ✅ **Manejo de errores** robusto
- ✅ **Variables de entorno** seguras
- ✅ **Listo para eventos personalizados**

## 🔒 Seguridad

- **Autenticación** con Firebase Auth
- **Variables de entorno** para credenciales sensibles
- **Rutas privadas** protegidas con `PrivateRoute`
- **Validación de datos** en cliente y servidor
- **HTTPS** en producción (Firebase Hosting)

## 📊 Base de Datos

### Tablas Principales

- `ventas` - Cabecera de ventas
- `detalles_venta` - Líneas de venta
- `productos_externos` - Inventario de productos
- `produccion` - Órdenes de producción
- `pedidos` - Pedidos de clientes
- `detalles_pedido` - Líneas de pedido
- `pagos` - Pagos de pedidos
- `compras` - Compras de productos
- `compras_items` - Items de compra (pendientes/inventariados)
- `materiales` - Gastos en materias primas
- `clientes` - Base de clientes
- `proveedores` - Base de proveedores
- `tipos_producto` - Tipos/categorías de productos

## 🤝 Contribución

Este es un proyecto privado. Para contribuir:

1. Crea un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Changelog

### v3.3.0 (Enero 2026) - Voice Order 5.0: Pro UX & Wake Lock 🚀
- 📱 **Anti-Sleep (Wake Lock API)**: El sistema mantiene la pantalla encendida automáticamente durante el dictado para evitar interrupciones.
- ⏱️ **Regla de Oro (Silencio Dinámico)**: Tiempos de espera inteligentes por campo (1.0s para números, 5.0s para direcciones/detalles).
- 🛑 **Comandos de Cierre Verbal**: Soporte para finalizar el registro diciendo *"Listo"*, *"Terminé"* o *"Fin"*.
- 🧠 **Psicología de Voz**: Mensajes de feedback no estresantes ("Te escucho", "Continúa...") para una mejor experiencia del usuario.
- 🛠️ **Arquitectura Robusta**: Implementación de `Refs` para evitar *stale closures* y mejorar la precisión del reconocimiento en tiempo real.

### v3.2.0 (Enero 2026) - Voice Order 4.0: Comprehensive Flow & UX Review 🎙️
- 🎤 **Flujo Completo de 4 Fases**:
  - **Fase 4 Pagos**: Integración de "Incluye IGV" y selección verbal de métodos de pago (Efectivo/Yape/Plin).
  - **Costo de Envío**: Sincronización visual garantizada del costo de envío mediante el parser numérico mejorado.
- 📋 **Modal de Revisión Final**:
  - Implementación de un **Resumen de Pedido** automático al finalizar la voz.
  - **Lectura por Voz (TTS)**: El sistema lee el resumen completo para validación auditiva.
  - **Guardado Manual**: Confirmación con un solo clic para persistencia en DB tras la revisión exitosa.
- ⏱️ **UX Adaptativa**:
  - **Silencio Dinámico**: Aumento de tolerancia (4s) en campos de dictado largo vs campos cortos (2.5s).
  - **Timeouts Extendidos**: Aumento a 12s para preguntas estándar para reducir la presión sobre el usuario.
- 🛠️ **Validación Inteligente**: Alerta verbal explícita para campos obligatorios omitidos.

### v3.1.0 (Enero 2026) - Voice Order 3.0: Silent & Rapid 🎤
- 🎤 **Refactor Estructural de Voz**:
  - **Fase 1 Optimizada**: Captura de Nombre, Teléfono y RUC/DNI en un solo flujo sin interrupciones.
  - **Avance Silencioso**: Eliminación de confirmaciones habladas ("...registrado") para máxima velocidad.
  - **Cierre Automático**: El micrófono se desconecta proactivamente tras registrar los datos personales para evitar errores.
  - **RUC/DNI Opcional**: Inteligencia para aceptar valores negativos ("No", "Paso") y cerrar la fase limpiamente.
- 🛠️ **Estabilidad Técnica**:
  - **Sync con Refs**: Implementación de `useRef` para el estado del micrófono, eliminando errores de sincronización y cierres inesperados.
  - **Validación Visual**: El sistema prioriza la corrección manual humana sobre la IA para garantizar datos 100% correctos.

### v3.0.0 (Enero 2026) - Dashboard Zen & UX Estructural 🧘‍♂️
- 🎨 **Dashboard Zen Ultra-Minimalista**:
  - **Rediseño Estructural**: Nueva interfaz de panel basada en "Capas y Contraste" con fondo neutro y tarjetas flotantes para una distinción clara.
  - **Jerarquía Visual por Color**: Uso estratégico de color únicamente en iconos principales para guiar el ojo (Ventas: Azul, Pedidos: Ámbar, Producción: Esmeralda).
- 📱 **UX Mobile de Alto Impacto**:
  - **Layout de 2 Columnas Forzado**: En dispositivos móviles, las acciones y sus reportes ahora se visualizan siempre en pares (lado a lado), optimizando el espacio vertical.
  - **Orden Jerárquico Estricto**: Priorización inteligente mediante `order-x` (Ventas > Pedidos > Producción).
- ✍️ **Copy UX & Micro-interacciones**:
  - **Lenguaje de Verbos**: Sustitución de etiquetas técnicas por acciones directas: *"Gestionar ventas"*, *"Entrar a taller"*, *"Ver historial"*.
  - **Header Minimalista**: Limpieza total de cabecera; eliminación de iconos distractores y simplificación cromática a negro/gris.
  - **Tipografía Editorial**: Fuentes pequeñas y pesos medios para una estética profesional "Zen".

### v2.9.0 (Enero 2026) - Inventario Consolidado & UX Ágil 🚀
- 📦 **Inventario por Código Único**:
  - **Agrupación Inteligente**: El reporte de inventario ahora consolida registros automáticamente por `codigo_usuario`.
  - **Saldo Total Acumulado**: Muestra la suma real de stock (Producido + Comprado) en una sola fila por código.
  - **Consistencia en Ventas**: El módulo de ventas consume ahora este inventario consolidado para una selección precisa.
- 🖼️ **Diseño "No-Images" en Reportes**:
  - Eliminación total de la columna de imágenes en el reporte de inventario para una carga instantánea y vista técnica.
  - Removida toda dependencia lógica de imágenes en el flujo inventario-ventas.
- 📝 **Nuevo Formulario de Producto (Stock)**:
  - **Registro Ultra-Rápido**: Nombre opcional y eliminación del campo "Stock Mínimo" para agilizar el ingreso.
  - **Grid de Precios Simétrico**: Cuadrícula de 2 columnas para campos numéricos (Stock, Costo, Precio, Oferta).
  - **Prioridad al Código**: El campo "Código" ahora es el primer campo del formulario con vista previa de QR.
- 🎨 **UI Técnica & Premium**:
  - **Estandarización de Fuentes**: Todo el reporte usa fuente pequeña (`text-xs`) sin negritas para una visualización uniforme.
  - **Origen Simplificado**: Visualización de origen (Prod./Compra) como texto plano pequeño, eliminando el formato de botón.
  - **Limpieza de Símbolos**: Remoción de símbolos monetarios "S/" de las celdas, moviéndolos a los encabezados de columna.

### v2.8.0 (Enero 2026) - POS UI Redesign & UX Elegance ✨
- 🎨 **Rediseño Total del Punto de Venta**:
  - **Light Style & Minimalismo**: Interfaz más limpia, con paleta de colores curada y enfoque en el espacio en blanco.
  - **Mobile-First UX**: Optimización completa para dispositivos táctiles; la lista de productos se integra fluidamente en el resumen en vistas móviles.
  - **Pagos Simplificados**: Nuevo selector de 3 opciones (EFEC, DIGIT, CRED) con iconos minimalistas y tipografía reducida.
  - **Acceso Rápido a Clientes**: Botón dedicado en la cabecera del resumen para selección inmediata de clientes.
  - **Botón de Acción Unificado**: Botón "Cobrar / Confirmar Crédito" en gris oscuro/negro, dinámico según el método de pago elegido.
- 🛠️ **Refinamiento de Detalles**:
  - **Legibilidad**: Reducción de tamaños de fuente y eliminación de textos en negrita innecesarios para una estética premium.
  - **Inputs Limpios**: Eliminación de solapamiento de símbolos "S/" en los campos de edición de precio de cada ítem.
- 🐛 **Estabilidad**:
  - Corrección de error crítico de "pantalla blanca" al acceder a propiedades de cliente inexistentes.
  - Mejora en la lógica de visualización para evitar duplicidad de listas de productos en modo desktop.

### v2.7.0 (Enero 2026) - Enviar a Stock 3.0 🚀
- 📦 **Flujo de Ingreso "Zero-Click"**:
  - Nuevo modal dedicado para enviar producción de STOCK directamente al inventario.
  - **Detección Automática**: El sistema verifica la existencia del producto en tiempo real mientras se escribe el código.
  - **Creación Híbrida**: Si el código no existe, el sistema lo crea automáticamente; si existe, incrementa el stock.
  - **Aviso Informativo**: Alerta visual en color ámbar (`⚠️`) ante códigos nuevos para evitar errores.
- 🎨 **UI Premium & UX**:
  - **QR en Tiempo Real**: Generación visual del código QR dentro del modal a medida que se escribe.
  - **Auto-Capitalización**: Conversión automática a MAYÚSCULAS en el campo de código.
  - **Filtro de Enfoque**: Fondo con desenfoque (`backdrop-blur`) y bloqueo de scroll al abrir el modal.
  - **Carga de Datos Automática**: El tipo de producto se precarga desde el registro de producción.
- 🛠️ **Limpieza & Optimización**:
  - **Grid Inteligente**: Desaparición automática del icono "Enviar a Stock" una vez que el registro ha sido transferido.
  - **Consistencia de Datos**: Corrección de tipos de datos en la base de datos (Integer vs UUID) para total compatibilidad.

### v2.6.0 (Enero 2026) - Flujo de Pedidos 2.0 💸
- 💳 **Pagos Flexibles**:
  - Habilitado registro de pagos en cualquier estado del pedido (incluido Entregado).
  - Nuevo botón de pago (`FaMoneyBillWave`) en todas las vistas si existe saldo pendiente.
  - Pagos integrados directamente en el **Reporte de Pedidos**.
- 🚚 **Control de Entregas Estricto**:
  - Botón de entrega (`FaCar`) restringido solo a pedidos "Listos" (Terminados).
  - Eliminación de acciones de entrega desde la fase de "Producción" para evitar errores.
- 👁️ **Mejoras UX**:
  - Nuevo botón de acceso rápido al detalle (`FaEye`) en la grilla principal.
  - Columnas de acción estandarizadas en todas las pestañas.
  - Corrección de bugs visuales en tablas de producción.

### v2.4.0 (Enero 2026) - Modelo de Producción Artesanal 🛠️
- 🎨 **Modelo de Costos Simplificado**:
  - Eliminación de cálculo por horas (`horas_trabajo` * `costo_hora`).
  - Nuevo campo **Mano de Obra Directa** (input monetario directo).
  - Nuevo campo referencial **% Alquiler** (calculado sobre el costo base).
- 🔄 **Refactorización de Producción**:
  - Eliminación de campos QR/Código visuales en formulario y tablas (gestión interna).
  - Generación de códigos vacíos por defecto al pasar a inventario (ingreso manual).
- 📊 **Mejoras en Reportes**:
  - **Reporte de Ventas**: Ocultamiento automático de IGV si es 0.00.
  - **Detalle de Venta**: Precios unitarios inline y eliminación de subtotal redundante.

### v2.5.0 (Enero 2026) - Reporte Materiales UX 📱
- 📊 **Reporte de Materiales Renovado**:
  - **Diseño Híbrido**: Tabla tradicional en desktop, Scroll horizontal en móviles ("Hoja de cálculo").
  - **Optimización de Columnas**:
    - ✅ Nueva columna **Proveedor** visible.
    - ❌ Columna **Precio Unitario** eliminada (foco en totales).
  - **Interacción**: Eliminación directa de items desde el reporte.

### v2.3.0 (Enero 2026) - Transición 2026 ✨
- 🚀 **Transición al Año 2026**: Sistema de filtrado inteligente para iniciar el nuevo año con datos limpios
  - 📦 **Inventario Archivado**: Columna `estado_activo` en `productos_externos` para archivo automático de productos 2025
  - 📊 **Reportes 2026 por Defecto**: Los reportes y dashboards muestran año 2026 por defecto
  - 🔄 **Vista Híbrida de Pedidos**: Muestra pedidos de 2026 + pedidos activos pendientes de 2025
  - 🗂️ **Filtros Inteligentes**: Los datos históricos siguen accesibles mediante filtros de fecha
- 🐛 **Fix**: Corrección de timezone en Reporte de Ventas (zona horaria America/Lima)
- 🎨 **UI**: Reducción de tamaño de fuente en disclaimer de Nota de Pedido (más compacto)

### v2.2.0 (Diciembre 2025)
- 🚀 **Migración a Neon DB**: Módulo de Pedidos migrado exitosamente de Supabase a Neon PostgreSQL
- ✨ **Gestión de Entregas**: Flujo separado para pedidos terminados vs entregados
- 🎨 **Nota de Pedido Rediseñada**: Formato minimalista, alineación optimizada y disclaimer compacto
- 🛠️ **Refactorización UI**: Tablas de historial de entregas sin botones de acción (seguridad)
- 🐛 Corrección de lógica en filtros de producción

### v2.1.0 (Diciembre 2024)
- ✨ **Módulo de Compras mejorado** con reporte detallado
- ✨ **Modal de inventariar** simplificado y prellenado automático
- ✨ **Edición inline** de items de compra
- ✨ **Modal de visualización** de productos inventariados (solo lectura)
- ✨ **Gestión de tipos de producto** con CRUD completo
- 🎨 Auto-conversión a mayúsculas en códigos IQ
- 🎨 Stock entero sin decimales
- 🐛 Corrección de errores en guardado de productos

### v2.0.0 (Diciembre 2024)
- ✨ Sistema de pestañas VENTAS/ANULADAS
- ✨ Código de venta correlativo automático
- ✨ Integración de Google Analytics 4
- 🎨 Diseño responsive optimizado
- 🎨 Formato de fecha compacto (DD/MM/YY)
- 🎨 Filtros de fecha en 2 columnas
- 🐛 Corrección de errores en anulación de ventas

### v1.5.0 (Noviembre 2024)
- ✨ Módulo de Materiales/Insumos
- ✨ Módulo de Compras separado
- ✨ Productos Pendientes de creación
- 🎨 Mejoras en UI del módulo de Producción

## 📞 Contacto

- **Sitio Web**: [aldoartesanias.web.app](https://aldoartesanias.web.app)
- **Email**: contacto@aldoartesanias.com
- **WhatsApp**: +51 XXX XXX XXX

## 📄 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados © 2024 Aldo Artesanías.

---

**Desarrollado con ❤️ para Aldo Artesanías**

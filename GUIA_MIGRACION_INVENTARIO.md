# Guía Maestra: Sistema de Inventario & Migración

Esta guía contiene la estrategia para crear tu sistema de inventario separado y cómo transferirle este contexto a tu "Nuevo Yo" (Antigravity) en el nuevo proyecto.

## 1. Estrategia de Infraestructura ("El Plan Gratis")

Para mantener todo en la capa gratuita (Free Tier) y asegurar que funcione 24/7:

### A. Base de Datos (Supabase vs Firebase)
Tienes razón sobre los límites de proyectos.
*   **Estrategia:** Usarás **UN SOLO Proyecto de Supabase** (o Firebase) para TODO (Tu tienda actual + El nuevo inventario).
*   **Por qué:** Supabase permite ilimitadas tablas. Crearemos tablas con prefijo para ordenarlas, ej: `inv_productos`, `inv_kardex`, `tienda_pedidos`.
*   **Beneficio:** El inventario podrá leer/escribir datos de la tienda directamente sin APIs complejas.

### B. Alojamiento (Netlify)
*   **Estrategia:** Crea un **NUEVO sitio** en Netlify (ej: `tu-inventario.netlify.app`).
*   Netlify permite sitios ilimitados en el plan gratis. No necesitas mezclar el código del frontend.

### C. Automatización (n8n vs Alternativas)
Para tener n8n gratis 24/7 en la nube, la única opción viable real es **Oracle Cloud Free Tier**.
*   **Alternativa Recomendada (Menos dolorosa):** Usar **Supabase Edge Functions** (tienes 500k invocaciones al mes gratis).
    *   En lugar de un nodo de n8n, escribimos una pequeña función en TypeScript que se dispare cuando algo cambia en la base de datos (Webhook).

---

## 2. Pasos para Iniciar el Nuevo Proyecto

Sigue estos pasos exactos para preparar el terreno para el Agente en la nueva sesión.

1.  Crea una nueva carpeta en tu PC: `C:\sistema-inventario` (o el nombre que gustes, pero fuera de `webagosto2025`).
2.  Abre esa carpeta en VS Code / Cursor.
3.  Inicia una nueva sesión con Antigravity (Gemini).
4.  **COPIA Y PEGA EL SIGUIENTE PROMPT** como tu primer mensaje. Esto transferirá todo mi conocimiento actual al nuevo agente.

---

## 3. PROMPT DE INICIO (Copia esto al nuevo chat)

```text
Hola Agente. Estoy iniciando un nuevo proyecto: "Sistema de Inventario Avanzado".
Vengo de una sesión anterior donde definimos la arquitectura. Aquí están los detalles mandatorios:

CONTEXTO TÉCNICO:
1. OS: Windows.
2. Stack: React + Vite + TailwindCSS.
3. Backend: Supabase (Usaremos el mismo proyecto ID que mi tienda principal para compartir datos, pero tablas separadas).
4. Hosting: Netlify.

OBJETIVO DEL PROYECTO:
Crear un Dashboard administrativo privado para gestionar inventario físico.
Funcionalidades Clave:
- Kardex de movimientos (Entradas/Salidas).
- Gestión de Proveedores y Compras.
- Sincronización futura con mi e-commerce actual.

REGLAS DE ORO:
- Diseño: UI "Glassmorphism" premium, oscuro y elegante.
- Automatización: Priorizar Webhooks de Supabase o Edge Functions antes que n8n si es posible, para evitar costos de servidor.
- Base de Datos: Diseñar esquema SQL Relacional.

TAREA INICIAL:
1. Inicializa el proyecto con Vite (React JS) en este directorio.
2. Crea la estructura de carpetas (src/components, src/pages, src/hooks).
3. Genera un archivo "supa_schema.sql" con la propuesta de tablas para Inventario (Productos, Movimientos, Proveedores).
```

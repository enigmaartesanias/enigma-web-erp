# 🚀 Guía de Despliegue - Enigma Joyería de Autor

Este proyecto está alojado en **Firebase (Hosting y Cloud Functions)**. El dominio principal en producción es [artesaniasenigma.com](https://artesaniasenigma.com).

## Configuración del Proyecto

- **Repositorio GitHub**: https://github.com/enigmaartesanias/enigma-web-erp
- **Plataforma**: Firebase (Plan Blaze)
- **ID de Proyecto**: `aldoartesanias`
- **Dominio Principal**: https://artesaniasenigma.com
- **Subdominios Alternativos**:
  - https://aldoartesanias.web.app
  - https://aldoartesanias.firebaseapp.com

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalada globalmente la herramienta CLI de Firebase:
```bash
npm install -g firebase-tools
```
Y de haber iniciado sesión con tu cuenta de Google asociada al proyecto:
```bash
firebase login
```

---

## 🚀 Proceso de Despliegue

Sigue estos pasos para construir la aplicación React y desplegar tanto el Frontend (Hosting) como el Backend (Cloud Functions) a Firebase.

### 1. Construir la aplicación Frontend (React SPA)
Ejecuta la compilación de Vite en la raíz del proyecto. Esto generará la carpeta `dist/`:
```bash
npm run build
```

### 2. Desplegar a Firebase
Puedes desplegar todo el proyecto a la vez, o desplegar por separado según lo que hayas modificado:

- **Desplegar Todo (Recomendado cuando hay cambios en ambos lados):**
  ```bash
  firebase deploy
  ```

- **Desplegar Solo el Frontend (Si solo modificaste vistas/React):**
  ```bash
  firebase deploy --only hosting
  ```

- **Desplegar Solo las Funciones (Si solo modificaste la lógica de Open Graph en `functions/`):**
  ```bash
  firebase deploy --only functions
  ```

---

## ⚙️ Estructura del Despliegue

- **`dist/`**: Contiene el código frontend compilado listo para producción.
- **`firebase.json`**: Define el comportamiento de Firebase Hosting (redirecciones, reescrituras de rutas para el SPA y para el Open Graph) y registra la carpeta `functions/`.
- **`functions/`**: Contiene el código Node.js 22 de la Cloud Function `shareProduct` encargada de servir los metadatos dinámicos para los scrapers de redes sociales (WhatsApp, Facebook, Twitter, etc.).

---

## 📝 Notas Importantes

- **Plan de Facturación**: El proyecto requiere mantenerse en el plan **Blaze** en Firebase para poder utilizar Cloud Functions.
- **Variables de Entorno**: Las credenciales de Supabase se encuentran directamente en `src/supabaseClient.jsx` (para el frontend) y se replican de forma estática en `functions/index.js` (para la Cloud Function) para asegurar que el backend funcione independientemente de variables externas durante el deploy.
- **Node.js**: Las funciones se ejecutan bajo Node.js versión `22`. Asegúrate de tener esta versión en tu entorno local para evitar advertencias durante las pruebas con emuladores.

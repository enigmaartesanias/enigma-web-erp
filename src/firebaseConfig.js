// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Helper para verificar variables de entorno
const checkEnv = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        console.warn(`⚠️ La variable de entorno ${key} no está definida.`);
    }
    return value;
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: checkEnv("VITE_FIREBASE_API_KEY"),
    authDomain: checkEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: checkEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: checkEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: checkEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: checkEnv("VITE_FIREBASE_APP_ID"),
    measurementId: checkEnv("VITE_FIREBASE_MEASUREMENT_ID") // Google Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

// Initialize Analytics (solo en producción y si está disponible)
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
    try {
        analytics = getAnalytics(app);
        console.log('✅ Google Analytics inicializado correctamente');
    } catch (error) {
        console.warn('⚠️ No se pudo inicializar Analytics:', error);
    }
}

export { storage, auth, analytics };
export default app;

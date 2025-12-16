// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Helper para verificar variables de entorno
const checkEnv = (key) => {
    const value = import.meta.env[key];
    if (!value) {
        console.warn(`⚠️ La variable de entorno ${key} no está definida. La subida de imágenes no funcionará.`);
    }
    return value;
};

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: checkEnv("VITE_FIREBASE_API_KEY"),
    authDomain: checkEnv("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: checkEnv("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: checkEnv("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: checkEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: checkEnv("VITE_FIREBASE_APP_ID")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };

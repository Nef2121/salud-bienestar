import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// La configuración viene del archivo .env (variables EXPO_PUBLIC_*).
// Nota: la apiKey de Firebase para apps cliente no es un secreto; la seguridad
// real la dan las reglas de Firestore (ver firestore.rules) y Authentication.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Falta la configuración de Firebase. Copia .env.example como .env y completa los valores.',
  );
}

const yaInicializada = getApps().length > 0;
export const app = yaInicializada ? getApp() : initializeApp(firebaseConfig);

function crearAuth() {
  if (Platform.OS === 'web') return getAuth(app);
  // En Android la sesión se guarda en AsyncStorage para no pedir login cada vez.
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    // Recarga en caliente: Auth ya estaba inicializado.
    return getAuth(app);
  }
}

export const auth = crearAuth();
export const db = getFirestore(app);

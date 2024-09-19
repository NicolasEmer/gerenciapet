import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa o AsyncStorage
import { getFirestore } from 'firebase/firestore'; // Importa o Firestore
import { getStorage } from 'firebase/storage'; // Importa o Storage

// Configurações do Firebase do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyCikf3DPtxq5aiyBUr-2U-45z10xSUgJoU",
  authDomain: "gerenciapet-fc1b2.firebaseapp.com",
  projectId: "gerenciapet-fc1b2",
  storageBucket: "gerenciapet-fc1b2.appspot.com",
  messagingSenderId: "814782007721",
  appId: "1:814782007721:android:74cd4659a23aab61cfdcb8"
};

// Inicialize o Firebase apenas se ainda não foi inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Obtenha a instância do Firebase Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Obtenha a instância do Firestore
const db = getFirestore(app);

// Obtenha a instância do Storage
const storage = getStorage(app); // Inicializa o Firebase Storage

export { auth, db, storage };

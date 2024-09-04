import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

// Obtenha a instância do Firebase Auth
const auth = getAuth(app);

export { auth };

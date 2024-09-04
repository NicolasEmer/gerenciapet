// firebaseConfig.js
import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDYRtiDo5djHWsM9HLAoSH6XhRMdbkehoI",
  authDomain: "universo.univates.br",
  projectId: "gerenciapet-fc1b2",
  storageBucket: "gs://gerenciapet-fc1b2.appspot.com",
  messagingSenderId: "814782007721",
  appId: "1:814782007721:android:74cd4659a23aab61cfdcb8"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();

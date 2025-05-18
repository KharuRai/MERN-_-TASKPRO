import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAWP-gPKpLcP9-kn-ltWR0y9SnVh7yZdW0",
  authDomain: "auth-8ce41.firebaseapp.com",
  projectId: "auth-8ce41",
  storageBucket: "auth-8ce41.firebasestorage.app",
  messagingSenderId: "86467918418",
  appId: "1:86467918418:web:871c65ffdc8d13922b7d8b",
  measurementId: "G-BCZL3BLBE1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app; 
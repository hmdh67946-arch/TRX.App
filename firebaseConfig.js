import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBD5fg-zAI95iQXmFtR_usFkdGMXy0KtbI',
  authDomain: 'trxapp-be7f0.firebaseapp.com',
  projectId: 'trxapp-be7f0',
  storageBucket: 'trxapp-be7f0.firebasestorage.app',
  messagingSenderId: '66347183519',
  appId: '1:66347183519:web:c4fc483920189009bf61aa',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

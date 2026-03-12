// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkpOIg15o6FgTsVCtEqvcfcM6qL_gcreE",
    authDomain: "login-69653.firebaseapp.com",
    projectId: "login-69653",
    storageBucket: "login-69653.firebasestorage.app",
    messagingSenderId: "850376305636",
    appId: "1:850376305636:web:25af40a91f4ed915e735f1",
    measurementId: "G-SJF9LPYHZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Optional: Customize Google Auth Provider
googleProvider.setCustomParameters({
    prompt: 'select_account' // Forces account selection even if user has one account
});

export default app;

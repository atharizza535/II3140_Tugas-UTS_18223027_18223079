// src/services/firebase.js
import { getAuth } from "firebase/auth";
// (Opsional, jika Anda menggunakan Firestore untuk database)
// import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDb9mkxbLkiXo72OjDAdDNQRcW3GOlcbZQ",
  authDomain: "dasbor-asisten.firebaseapp.com",
  projectId: "dasbor-asisten",
  storageBucket: "dasbor-asisten.firebasestorage.app",
  messagingSenderId: "343134269817",
  appId: "1:343134269817:web:5aff1e6a1deccbe1d83fa8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Ekspor modul yang kita butuhkan di bagian lain aplikasi
export const auth = getAuth(app);
// export const db = getFirestore(app); // Aktifkan jika pakai Firestore
export default app;
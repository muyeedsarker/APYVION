// APYVION — Firebase client adapter (browser-safe)
// Firebase Web SDK v12.6.0 via ESM CDN. Add firebase-config.js before this file.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const config = window.AI_APP_FACTORY_FIREBASE_CONFIG;
const configured = config && config.apiKey && !String(config.apiKey).startsWith("YOUR_") && config.projectId && !String(config.projectId).startsWith("YOUR_");

let app = null, auth = null, db = null, storage = null;
if (configured) {
  app = getApps().length ? getApp() : initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage, configured, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp, ref, uploadBytes, getDownloadURL, deleteObject };

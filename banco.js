// Inicialização do Firebase (CDN modules) e re-export dos helpers do Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import {
  getFirestore,
  doc as _doc,
  setDoc as _setDoc,
  getDoc as _getDoc,
  getDocs as _getDocs,
  deleteDoc as _deleteDoc,
  collection as _collection
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpSKqS7QcDbL_TjaErG8XLVh5TRpJMizQ",
  authDomain: "cicloinovacao-v2.firebaseapp.com",
  projectId: "cicloinovacao-v2",
  storageBucket: "cicloinovacao-v2.firebasestorage.app",
  messagingSenderId: "864853126343",
  appId: "1:864853126343:web:6929b5bb8131149839a2e2",
  measurementId: "G-GPB37FEGFW"
};

const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (e) { /* Analytics pode falhar em ambientes sem DOM/permit */ }
const db = getFirestore(app);

export { app, db, _doc as doc, _setDoc as setDoc, _getDoc as getDoc, _getDocs as getDocs, _collection as collection, _deleteDoc as deleteDoc };

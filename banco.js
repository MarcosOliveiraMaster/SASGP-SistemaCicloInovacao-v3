// Inicialização do Firebase (CDN modules) e re-export dos helpers do Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
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
let analyticsInitialized = false;

export async function ensureAnalytics() {
  if (analyticsInitialized) return;
  // skip analytics on local development to avoid blocked-by-client errors and unnecessary calls
  try {
    const host = (typeof location !== 'undefined' && location && location.hostname) ? location.hostname : '';
    const protocol = (typeof location !== 'undefined' && location && location.protocol) ? location.protocol : '';
    if (protocol === 'file:' || host === 'localhost' || host === '127.0.0.1') return;
  } catch (e) {}
  try {
    const consent = (typeof localStorage !== 'undefined') ? localStorage.getItem('ga_consent') : null;
    if (consent !== 'granted') return;
    // quick probe to see if analytics endpoint is reachable (adblockers often block it)
    let analyticsReachable = true;
    try {
      // use no-cors HEAD request; if blocked by client, this should throw
      await fetch('https://www.google-analytics.com/g/collect?v=1', { method: 'HEAD', mode: 'no-cors' });
    } catch (probeErr) {
      analyticsReachable = false;
      console.info('Analytics probe failed; skipping analytics init.');
    }
    if (!analyticsReachable) return;
    const mod = await import("https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js");
    if (mod && typeof mod.getAnalytics === 'function') {
      try { mod.getAnalytics(app); analyticsInitialized = true; } catch (e) { console.warn('Analytics init failed', e); }
    }
  } catch (e) {
    console.warn('ensureAnalytics error', e);
  }
}

// If consent was previously granted, initialize analytics immediately (but skip on local/dev)
try {
  (async () => {
    try {
      const host = (typeof location !== 'undefined' && location && location.hostname) ? location.hostname : '';
      const protocol = (typeof location !== 'undefined' && location && location.protocol) ? location.protocol : '';
      if (protocol === 'file:' || host === 'localhost' || host === '127.0.0.1') return;
    } catch (e) {}
    if (typeof localStorage !== 'undefined' && localStorage.getItem('ga_consent') === 'granted') await ensureAnalytics();
  })();
} catch(e) {}
const db = getFirestore(app);

export { app, db, _doc as doc, _setDoc as setDoc, _getDoc as getDoc, _getDocs as getDocs, _collection as collection, _deleteDoc as deleteDoc };

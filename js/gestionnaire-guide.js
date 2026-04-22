/**
 * PROSERPINE - Gestionnaire du Guide de Tri (Synchronisé)
 * Gère la récupération des consignes depuis Firestore et le cache local.
 */

import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  setDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from './configuration-firebase.js';

const CACHE_KEY = 'proserpine_guide_cache';
const CACHE_TIME_KEY = 'proserpine_guide_last_sync';

export const GuideManager = {
  /**
   * Récupère les détails d'une catégorie (ex: pmc)
   * Tente d'abord Firestore, sinon utilise le cache local.
   */
  async getCategoryDetails(id) {
    // 1. Tenter de récupérer depuis Firestore
    try {
      const docRef = doc(db, "guide_consignes", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.updateLocalCache(id, data);
        return data;
      }
    } catch (error) {
      console.warn("Firestore inaccessible, utilisation du cache local:", error);
    }

    // 2. Fallback sur le cache local
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    return cache[id] || null;
  },

  /**
   * Met à jour le cache local pour une catégorie
   */
  updateLocalCache(id, data) {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[id] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    localStorage.setItem(CACHE_TIME_KEY, new Date().toISOString());
  },

  /**
   * Récupère la date de dernière synchronisation
   */
  getLastSyncDate() {
    return localStorage.getItem(CACHE_TIME_KEY);
  },

  /**
   * SEEDING : Initialise la base de données avec les données par défaut (Intradel)
   * À appeler une seule fois ou pour forcer une mise à jour globale.
   */
  async seedDatabase(data) {
    console.log("Initialisation de la base de données en ligne...");
    for (const [id, content] of Object.entries(data)) {
      await setDoc(doc(db, "guide_consignes", id), {
        ...content,
        updatedAt: serverTimestamp()
      });
    }
    console.log("Synchronisation initiale terminée !");
  }
};

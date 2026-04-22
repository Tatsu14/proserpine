/**
 * PROSERPINE - Data Manager
 * Centralise les appels API Open Food Facts et la logique Firestore
 */

import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";


export const DataManager = {
  /**
   * Recherche des produits via le proxy Vercel
   */
  async searchProducts(queryStr) {
    const fields = 'code,product_name_fr,product_name,brands,image_small_url';
    const url = `/api/off-proxy?query=${encodeURIComponent(queryStr)}&fields=${fields}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur réseau via proxy');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error("Erreur searchProducts:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails complets d'un produit via le proxy Vercel
   */
  async fetchFullProduct(barcode) {
    const fields = 'code,product_name_fr,product_name,brands,image_front_url,packaging_tags,origins_tags,labels_tags,nova_group,ecoscore_data,packaging,categories_tags';
    const url = `/api/off-proxy?barcode=${barcode}&fields=${fields}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Produit introuvable via proxy');
      const data = await response.json();
      if (data.status === 'success' || data.status === 1) {
        return data.product;
      }
      return null;
    } catch (error) {
      console.error("Erreur fetchFullProduct:", error);
      throw error;
    }
  },

  /**
   * Map les données OFF vers le format Proserpine
   */
  mapOFFToProserpine(offProduct) {
    // Base ACV : On utilise le score environnemental EF si disponible
    const efScore = offProduct.ecoscore_data?.scores?.ef ?? 50;

    // Analyse Emballage
    const packTags = (offProduct.packaging_tags || []).join(" ").toLowerCase();
    let packagingType = "FULLY_RECYCLABLE";
    if (packTags.includes("verre") || packTags.includes("glass"))
      packagingType = "REUSABLE_GLASS";
    else if (packTags.includes("plastique") || packTags.includes("plastic"))
      packagingType = "PLASTIC_WRAP";
    else if (packTags.includes("aluminium") || packTags.includes("metal"))
      packagingType = "FULLY_RECYCLABLE";

    // Analyse Origine (Transport)
    const originTags = (offProduct.origins_tags || []).join(" ").toLowerCase();
    let transportMode = "ROAD_TRUCK"; 
    let isLocal = false;
    if (
      originTags.includes("belgique") ||
      originTags.includes("belgium") ||
      originTags.includes("france") ||
      originTags.includes("liège")
    ) {
      transportMode = "LOCAL_SHORT_CIRCUIT";
      isLocal = true;
    } else if (
      originTags.includes("amérique") ||
      originTags.includes("asia") ||
      originTags.includes("brazil")
    ) {
      transportMode = "AIR_FREIGHT";
    }

    // Analyse Agriculture
    const labelTags = (offProduct.labels_tags || []).join(" ").toLowerCase();
    let agriculturePractice = "CONVENTIONAL";
    if (labelTags.includes("bio") || labelTags.includes("organic"))
      agriculturePractice = "CERTIFIED_ORGANIC";

    // Analyse Transformation (NOVA)
    const nova = offProduct.nova_group || 3;
    let processingLevel = "PROCESSED";
    if (nova === 1) processingLevel = "UNPROCESSED";
    else if (nova === 4) processingLevel = "ULTRA_PROCESSED";

    // Calcul Proserpine via moteur-score.js (chargé globalement via script tag)
    const attributes = {
      carbonScore: efScore,
      waterScore: efScore,
      soilBiodiversityScore: efScore,
      eutrophicationScore: efScore,
      airQualityScore: efScore,
      fossilResourcesScore: efScore,
      packagingType,
      transportMode,
      agriculturePractice,
      processingLevel,
    };

    const score = window.ProserpineLogic.Calculator.calculate(attributes);

    // Déduction du matériau pour l'impact (Liège)
    let materialKey = "Default";
    if (packagingType === "REUSABLE_GLASS") materialKey = "Verre";
    else if (packagingType === "PLASTIC_WRAP") materialKey = "PET";
    else if (packTags.includes("alu")) materialKey = "Alu";
    else if (packTags.includes("carton")) materialKey = "Carton";

    const impact = window.ProserpineLogic.Impact.calculateSessionImpact(materialKey);

    // Génération du verdict
    let verdict = `Analyse dynamique terminée. `;
    if (isLocal) verdict += `Excellent point : ce produit provient d'un circuit court. `;
    if (nova === 4) verdict += `Attention : produit ultra-transformé (NOVA 4). `;
    if (agriculturePractice === "CERTIFIED_ORGANIC") verdict += `Label Bio détecté. `;
    if (packagingType === "PLASTIC_WRAP") verdict += `Emballage plastique détecté, triez-le dans le sac Bleu PMC. `;
    if (packagingType === "REUSABLE_GLASS") verdict += `Verre détecté, direction la bulle à verre. `;

    return {
      barcode: offProduct.code,
      name: offProduct.product_name_fr || offProduct.product_name || "Produit Inconnu",
      brand: offProduct.brands || "Marque inconnue",
      ecoScore: score,
      packaging: offProduct.packaging || "Non spécifié",
      image: offProduct.image_front_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200",
      impact: impact,
      verdict: verdict,
      origin: isLocal ? "Local" : "Importé",
      nova: nova,
    };
  },

  /**
   * Sauvegarde un produit dans l'historique Firestore
   */
  async saveToHistory(db, uid, product) {
    const historyRef = collection(db, 'users', uid, 'history');
    
    try {
      // Vérifier les doublons récents
      const q = query(historyRef, orderBy('scannedAt', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const alreadyExists = snapshot.docs.some(doc => doc.data().barcode === product.barcode);
      
      if (alreadyExists) return;

      await addDoc(historyRef, {
        ...product,
        scannedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Erreur saveToHistory:", error);
    }
  },

  /**
   * Charge l'historique depuis Firestore
   */
  async loadHistory(db, uid) {
    const historyRef = collection(db, 'users', uid, 'history');
    const q = query(historyRef, orderBy('scannedAt', 'desc'), limit(20));
    
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erreur loadHistory:", error);
      return [];
    }
  }
};



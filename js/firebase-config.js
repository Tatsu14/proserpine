// 1. Importation des outils Firebase (Version 12.12.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// 2. TA configuration exacte (fournie par Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyBr3xbq87GeqjhKP866KjsmyDdvgPv_X30",
    authDomain: "proserpine-5eadf.firebaseapp.com",
    projectId: "proserpine-5eadf",
    storageBucket: "proserpine-5eadf.firebasestorage.app",
    messagingSenderId: "725919778618",
    appId: "1:725919778618:web:c31e2626ea083c37973203",
    measurementId: "G-SB4FYQV4G6"
};

// 3. Initialisation de l'application
const app = initializeApp(firebaseConfig);

// 4. Exportation des outils pour qu'ils soient utilisables dans app.js
export const analytics = getAnalytics(app);
export const auth = getAuth(app); // Gère les mots de passe et la connexion
export const db = getFirestore(app); // Gère la sauvegarde de l'historique
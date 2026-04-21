import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { auth } from './firebase-config.js';

const detailsData = {
  pmc: {
    title: "Sacs Bleus PMC",
    content: "<h4>Acceptés :</h4><ul><li>Bouteilles et flacons en plastique</li><li>Emballages métalliques (canettes, conserves)</li><li>Cartons à boissons</li><li>Barquettes et raviers en plastique</li></ul><h4>Interdits :</h4><p>Pas de bidons d'huile moteur, pas de seringues, pas de jouets en plastique.</p>",
    color: "#3498db"
  },
  papier: {
    title: "Papiers / Cartons",
    content: "<h4>Acceptés :</h4><ul><li>Boîtes en carton</li><li>Sacs en papier</li><li>Journaux, magazines</li><li>Cahiers</li></ul><h4>Interdits :</h4><p>Pas de papier gras (pizza), pas de papiers souillés, pas de mouchoirs usagés.</p>",
    color: "#f1c40f"
  },
  organique: {
    title: "Déchets Organiques",
    content: "<h4>Acceptés :</h4><ul><li>Épluchures</li><li>Restes de repas</li><li>Marc de café, sachets thé</li><li>Petits déchets de jardin</li></ul><h4>Interdits :</h4><p>Pas de sacs plastiques, pas de litière de chat, pas de cendres de bois.</p>",
    color: "#27ae60"
  },
  verre: {
    title: "Bulles à Verre",
    content: "<h4>Acceptés :</h4><ul><li>Bouteilles en verre</li><li>Bocaux</li><li>Flacons de parfum</li></ul><h4>Interdits :</h4><p>Pas de vitres, pas de miroirs, pas d'ampoules (Recupel), pas de porcelaine.</p>",
    color: "#95a5a6"
  }
};

function initPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const data = detailsData[id];

  if (!data) {
    window.location.href = 'guide.html';
    return;
  }

  document.getElementById("guide-detail-title").innerText = data.title;
  document.getElementById("guide-detail-content").innerHTML = data.content;
  document.getElementById("guide-detail-header").style.background = data.color;

  document.getElementById("back-to-guide").addEventListener("click", () => {
    window.location.href = 'guide.html';
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'auth.html';
  } else {
    initPage();
  }
});

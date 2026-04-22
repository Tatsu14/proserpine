import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { auth } from './configuration-firebase.js';
import { GuideManager } from './gestionnaire-guide.js';

// Données de base pour l'initialisation (Bootstrap)
const bootstrapData = {
  pmc: {
    title: "Sacs Bleus PMC",
    content: `
      <div class="detail-section">
        <h3><span class="material-symbols-rounded">check_circle</span> Ce qui est accepté</h3>
        <div class="accepted-grid">
          <div class="item"><strong>Plastique :</strong> Bouteilles, flacons, raviers, pots de yaourt, barquettes, films plastiques, sachets, sacs à usage unique.</div>
          <div class="item"><strong>Métal :</strong> Canettes, boîtes de conserve, aérosols (cosmétiques/alimentaires), barquettes en alu, capsules et bouchons.</div>
          <div class="item"><strong>Cartons à boissons :</strong> Briques de lait, de jus, de soupe, etc.</div>
        </div>
      </div>
      <div class="detail-section warning">
        <h3><span class="material-symbols-rounded">cancel</span> Ce qui est interdit</h3>
        <ul>
          <li>Emballages avec bouchons de sécurité (ex: détergents corrosifs).</li>
          <li>Emballages ayant contenu des produits toxiques (pictogrammes danger).</li>
          <li>Objets en plastique (jouets, seaux, brosses à dents).</li>
          <li>Frigolite (sauf barquettes alimentaires propres).</li>
        </ul>
      </div>
      <div class="detail-section tip">
        <h3><span class="material-symbols-rounded">lightbulb</span> Conseils de pro</h3>
        <p>Videz bien vos emballages (inutile de rincer). Aplatissez les bouteilles dans le sens de la longueur et remettez le bouchon pour gagner de la place.</p>
      </div>
    `,
    color: "#3498db"
  },
  papier: {
    title: "Papiers / Cartons",
    content: `
      <div class="detail-section">
        <h3><span class="material-symbols-rounded">check_circle</span> Ce qui est accepté</h3>
        <ul>
          <li>Journaux, magazines, publicités, livres.</li>
          <li>Sacs en papier, boîtes en carton découpées et aplaties.</li>
          <li>Papiers de bureau, enveloppes (même avec fenêtre).</li>
        </ul>
      </div>
      <div class="detail-section warning">
        <h3><span class="material-symbols-rounded">cancel</span> Ce qui est interdit</h3>
        <ul>
          <li>Papier gras ou souillé (ex: boîte de pizza avec gras).</li>
          <li>Papier carbone, papier peint, papier autocollant.</li>
          <li>Mouchoirs, essuie-tout et serviettes en papier.</li>
        </ul>
      </div>
    `,
    color: "#f1c40f"
  },
  organique: {
    title: "Déchets Organiques",
    content: `
      <div class="detail-section">
        <h3><span class="material-symbols-rounded">restaurant</span> Ce qui est accepté</h3>
        <ul>
          <li>Épluchures de fruits et légumes.</li>
          <li>Restes de repas (cuits ou crus).</li>
          <li>Marc de café, filtres en papier, sachets de thé.</li>
        </ul>
      </div>
      <div class="detail-section info">
        <h3><span class="material-symbols-rounded">compost</span> Impact Écologique</h3>
        <p>Vos déchets organiques sont transformés en compost et en énergie verte (biométhanisation) en Province de Liège.</p>
      </div>
    `,
    color: "#27ae60"
  },
  verre: {
    title: "Bulles à Verre",
    content: `
      <div class="detail-section">
        <h3><span class="material-symbols-rounded">check_circle</span> Ce qui est accepté</h3>
        <p>Uniquement le <strong>verre creux</strong> :</p>
        <ul>
          <li>Bouteilles de vin, bière, jus.</li>
          <li>Bocaux de conserve (confiture, sauce).</li>
          <li>Flacons de parfum et cosmétiques en verre.</li>
        </ul>
      </div>
      <div class="detail-section warning">
        <h3><span class="material-symbols-rounded">cancel</span> Ce qui est interdit</h3>
        <ul>
          <li>Verre plat (vitres, miroirs).</li>
          <li>Porcelaine, céramique, terre cuite.</li>
          <li>Cristal, Pyrex.</li>
        </ul>
      </div>
    `,
    color: "#95a5a6"
  },
  residuel: {
    title: "Déchets Résiduels",
    content: `
      <div class="detail-section">
        <h3><span class="material-symbols-rounded">delete_outline</span> Qu'est-ce que c'est ?</h3>
        <p>Tout ce qui ne peut pas être recyclé ou valorisé dans les autres filières.</p>
        <ul>
          <li>Langes, articles d'hygiène intime.</li>
          <li>Litières minérales, sacs d'aspirateur.</li>
          <li>Papiers et cartons très souillés.</li>
        </ul>
      </div>
    `,
    color: "#4a4a4a"
  },
  recyparc: {
    title: "Recyparc (Parc à Conteneurs)",
    content: `
      <div class="detail-section warning">
        <h3><span class="material-symbols-rounded">warning</span> Déchets Spéciaux</h3>
        <ul>
          <li><strong>Déchets Spéciaux :</strong> Peintures, solvants, huiles, piles, batteries.</li>
          <li><strong>Encombrants :</strong> Vieux meubles, matelas.</li>
          <li><strong>Électro (Recupel) :</strong> Frigos, machines à laver, écrans.</li>
        </ul>
      </div>
    `,
    color: "#e74c3c"
  }
};

async function initPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  if (!id) {
    window.location.href = 'guide.html';
    return;
  }

  // Affichage immédiat d'un loader ou du cache si possible
  document.getElementById("guide-detail-title").innerText = "Chargement...";

  // Récupération des données synchronisées
  const data = await GuideManager.getCategoryDetails(id);

  // Si aucune donnée en ligne/cache, on initialise avec le bootstrap (Premier lancement)
  if (!data) {
    console.log("Premier lancement : Synchronisation initiale...");
    await GuideManager.seedDatabase(bootstrapData);
    window.location.reload();
    return;
  }

  document.getElementById("guide-detail-title").innerText = data.title;
  document.getElementById("guide-detail-content").innerHTML = data.content;
  document.getElementById("guide-detail-header").style.background = data.color;

  // Affichage de la date de sync
  const lastSync = GuideManager.getLastSyncDate();
  if (lastSync) {
    const date = new Date(lastSync);
    const syncInfo = document.createElement("p");
    syncInfo.className = "sync-info";
    syncInfo.innerHTML = `<span class="material-symbols-rounded">sync</span> Synchronisé le ${date.toLocaleDateString()} à ${date.toLocaleTimeString()}`;
    document.getElementById("guide-detail-content").appendChild(syncInfo);
  }

  document.getElementById("back-to-guide").addEventListener("click", () => {
    window.location.href = 'guide.html';
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'authentification.html';
  } else {
    initPage();
  }
});



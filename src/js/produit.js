import { onAuthStateChanged } from "firebase/auth";
import { auth } from './configuration-firebase.js';

function setGaugeProgress(percent) {
  const circle = document.querySelector(".progress-ring__circle");
  if (!circle) return;
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function initPage() {
  const productData = sessionStorage.getItem('proserpine_current_product');
  if (!productData) {
    window.location.href = 'accueil.html';
    return;
  }

  const product = JSON.parse(productData);
  renderProduct(product);

  document.getElementById("back-to-home").addEventListener("click", () => {
    window.location.href = 'accueil.html';
  });
}

function renderProduct(product) {
  // Image
  const imgContainer = document.getElementById("product-hero-img");
  if (imgContainer) {
    imgContainer.innerHTML = `<img src="${product.image}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; border:2px solid white;" alt="">`;
  }

  // Score
  document.getElementById("score-display").innerText = product.ecoScore;
  setGaugeProgress(product.ecoScore);

  // Titre & Marque
  document.getElementById("product-name").innerText = product.name;
  document.getElementById("product-brand").innerText = `Marque: ${product.brand}`;
  
  // Verdict
  document.getElementById("product-verdict").innerText = product.verdict;

  // Badges
  document.getElementById("badge-origin").innerHTML = `<span class="material-symbols-rounded">public</span> ${product.origin || "Inconnu"}`;
  document.getElementById("badge-nova").innerHTML = `<span class="material-symbols-rounded">science</span> NOVA ${product.nova || "?"}`;
  document.getElementById("badge-co2").innerHTML = `<span class="material-symbols-rounded">co2</span> ${product.ecoScore > 60 ? "Bas" : "Elevé"}`;

  // Consignes
  const binName = product.ecoScore > 60 ? "Sac Bleu PMC" : "Déchets Résiduels";
  const instruction = "Vider avant recyclage";

  document.getElementById("bin-name").innerText = binName.toUpperCase();
  document.getElementById("bin-instruction").innerText = instruction;

  // Débogage
  const debugEl = document.getElementById("debug-content");
  if (debugEl) {
    debugEl.textContent = JSON.stringify(product, null, 2);
  }
}

// Auth Guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'authentification.html';
  } else {
    initPage();
  }
});



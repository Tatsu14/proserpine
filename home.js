import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { auth, db } from './firebase-config.js';
import { DataManager } from './dataManager.js';

let currentUser = null;

const UI = {
  setLoading(show) {
    const loader = document.getElementById("loading-overlay");
    if (loader) {
      loader.style.display = show ? "flex" : "none";
      loader.setAttribute("aria-hidden", !show);
    }
  },
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast-pro ${type}`;
    toast.innerHTML = `
      <span class="material-symbols-rounded">${type === "success" ? "check_circle" : "error"}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    container.style.display = "flex";
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) container.style.display = "none";
      }, 300);
    }, 3000);
  }
};

const Utils = {
  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

async function initPage(user) {
  currentUser = user;
  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = user.displayName || user.email.split('@')[0];

  // Charger l'historique
  await loadAndRenderHistory();
  
  // Setup Recherche
  setupSearch();
}

async function loadAndRenderHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;

  try {
    const history = await DataManager.loadHistory(db, currentUser.uid);
    if (history.length === 0) {
      list.innerHTML = '<p class="empty-msg">Aucun produit consulté pour le moment. Utilisez la recherche pour commencer !</p>';
      return;
    }

    list.innerHTML = "";
    const fragment = document.createDocumentFragment();
    history.forEach(product => {
      const item = document.createElement("div");
      item.className = "product-item clickable-product";
      
      const scoreClass = product.ecoScore > 70 ? "green-bg" : "orange-bg";
      const scoreBadgeClass = product.ecoScore > 70 ? "green-score" : "orange-score";

      item.innerHTML = `
        <div class="item-img ${scoreClass}">
          <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; border-radius:12px; object-fit:cover;">
        </div>
        <div class="item-details">
          <h4>${product.name.substring(0, 25)}</h4>
          <p>${product.brand || "Marque inconnue"}</p>
        </div>
        <div class="score-badge ${scoreBadgeClass}">
          <span>${product.ecoScore}</span>
        </div>
      `;

      item.addEventListener("click", () => {
        sessionStorage.setItem('proserpine_current_product', JSON.stringify(product));
        window.location.href = 'product.html';
      });

      fragment.appendChild(item);
    });
    list.appendChild(fragment);
  } catch (error) {
    console.error("Erreur chargement historique:", error);
  }
}

function setupSearch() {
  const searchInput = document.getElementById("home-search-input");
  const resultsEl = document.getElementById("home-search-results");
  const searchBtn = document.getElementById("home-search-btn");

  if (!searchInput || !resultsEl) return;

  const performSearch = Utils.debounce(async (query) => {
    if (query.length < 3) {
      resultsEl.innerHTML = "";
      return;
    }

    if (searchBtn) searchBtn.classList.add("loading");

    try {
      const products = await DataManager.searchProducts(query);
      renderSearchResults(products);
    } catch (error) {
      UI.showToast("Erreur lors de la recherche", "error");
    } finally {
      if (searchBtn) searchBtn.classList.remove("loading");
    }
  }, 350);

  searchInput.addEventListener("input", (e) => performSearch(e.target.value.trim()));
}

function renderSearchResults(products) {
  const resultsEl = document.getElementById("home-search-results");
  if (!resultsEl) return;

  if (products.length === 0) {
    resultsEl.innerHTML = '<div class="no-results">Aucun produit trouvé.</div>';
    return;
  }

  resultsEl.innerHTML = "";
  products.forEach(p => {
    const item = document.createElement("div");
    item.className = "suggestion-item";

    const img = document.createElement("img");
    img.src = p.image_small_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50';
    img.alt = "";
    img.style.cssText = "width:36px; height:36px; border-radius:var(--radius-sm); object-fit:cover;";

    const textWrapper = document.createElement("div");
    const name = document.createElement("div");
    name.style.cssText = "font-weight:var(--font-weight-bold); color:var(--color-text-dark);";
    name.textContent = p.product_name_fr || p.product_name || "Sans nom";
    
    const brand = document.createElement("div");
    brand.style.cssText = "font-size:var(--font-size-xs); color:var(--color-text-muted); opacity:0.8;";
    brand.textContent = p.brands || "Marque inconnue";
    
    textWrapper.appendChild(name);
    textWrapper.appendChild(brand);

    const left = document.createElement("div");
    left.style.cssText = "display:flex; align-items:center; gap:var(--space-2);";
    left.appendChild(img);
    left.appendChild(textWrapper);

    const chevron = document.createElement("span");
    chevron.className = "material-symbols-rounded";
    chevron.style.color = "var(--color-brand-primary)";
    chevron.textContent = "chevron_right";

    item.appendChild(left);
    item.appendChild(chevron);

    item.addEventListener("click", async () => {
      UI.setLoading(true);
      try {
        const fullProduct = await DataManager.fetchFullProduct(p.code);
        if (fullProduct) {
          const mapped = DataManager.mapOFFToProserpine(fullProduct);
          await DataManager.saveToHistory(db, currentUser.uid, mapped);
          sessionStorage.setItem('proserpine_current_product', JSON.stringify(mapped));
          window.location.href = 'product.html';
        } else {
          UI.showToast("Détails du produit introuvables", "error");
        }
      } catch (error) {
        UI.showToast("Erreur lors de la sélection", "error");
      } finally {
        UI.setLoading(false);
      }
    });

    resultsEl.appendChild(item);
  });
}

// Auth Guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'auth.html';
  } else {
    initPage(user);
  }
});

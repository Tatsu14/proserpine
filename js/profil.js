import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { auth } from './configuration-firebase.js';

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast-pro ${type}`;
  toast.innerHTML = `
    <span class="material-symbols-rounded">${type === "success" ? "check_circle" : "error"}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  container.classList.add('active');
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) container.classList.remove('active');
    }, 300);
  }, 3000);
}

function initPage(user) {
  document.getElementById("profile-name").textContent = user.displayName || user.email.split('@')[0];

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = 'authentification.html?mode=login';
      } catch (error) {
        showToast("Erreur lors de la déconnexion", "error");
      }
    });
  }
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'authentification.html';
  } else {
    initPage(user);
  }
});



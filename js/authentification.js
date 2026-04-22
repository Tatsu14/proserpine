import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { auth, db } from './configuration-firebase.js';

let isLoginMode = true;

const errorMessages = {
  'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/email-already-in-use': 'Cet email est déjà utilisé par un autre compte.',
  'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
  'auth/invalid-email': 'L\'adresse email n\'est pas valide.',
  'auth/too-many-requests': 'Trop de tentatives. Réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion internet.',
};

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
      if (container.children.length === 0) {
        container.classList.remove('active');
      }
    }, 300);
  }, 3000);
}

const Auth = {
  init() {
    const form = document.getElementById("auth-form");
    
    // Détection du mode (Inscription par défaut, Connexion si paramètre URL ou compte existant)
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccount = localStorage.getItem('proserpine_has_account');
    
    if (urlParams.get('mode') === 'login' || hasAccount === 'true') {
      isLoginMode = true;
    } else {
      isLoginMode = false;
    }

    this.updateUI();

    // Check if already logged in
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // Enregistrer qu'un compte a été créé/utilisé sur cet appareil
        localStorage.setItem('proserpine_has_account', 'true');
        window.location.href = 'accueil.html';
      }
    });

    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    const forgotBtn = document.getElementById("forgot-password-btn");
    if (forgotBtn) {
      forgotBtn.addEventListener("click", () => this.handlePasswordReset());
    }
  },

  updateUI() {
    const title = document.getElementById("auth-title");
    const subtitle = document.getElementById("auth-subtitle");
    const submitBtn = document.getElementById("auth-submit-btn");
    const usernameGroup = document.getElementById("group-username");
    const usernameInput = document.getElementById("auth-username");
    const forgotBtn = document.getElementById("forgot-password-btn");

    if (isLoginMode) {
      title.textContent = "Se connecter";
      subtitle.textContent = "Content de vous revoir sur Proserpine";
      submitBtn.querySelector('span').textContent = "Connexion";
      if (usernameGroup) usernameGroup.classList.add("hidden");
      if (usernameInput) usernameInput.required = false;
      if (forgotBtn) forgotBtn.classList.remove("hidden");
    } else {
      title.textContent = "S'inscrire";
      subtitle.textContent = "Rejoignez la communauté Proserpine";
      submitBtn.querySelector('span').textContent = "Créer un compte";
      if (usernameGroup) usernameGroup.classList.remove("hidden");
      if (usernameInput) usernameInput.required = true;
      if (forgotBtn) forgotBtn.classList.add("hidden");
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const username = document.getElementById("auth-username").value;
    const submitBtn = document.getElementById("auth-submit-btn");

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        // La redirection se fera via onAuthStateChanged
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Sauvegarde du nom d'utilisateur dans le profil
        await updateProfile(user, { displayName: username });

        // Création du document utilisateur dans Firestore
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          createdAt: serverTimestamp(),
          scanCount: 0
        });

        showToast("Compte créé avec succès !");
      }
    } catch (error) {
      console.error("Erreur Auth:", error);
      const message = errorMessages[error.code] || "Une erreur est survenue lors de l'authentification.";
      showToast(message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");
    }
  },

  async handlePasswordReset() {
    const email = document.getElementById("auth-email").value;
    if (!email) {
      showToast("Veuillez entrer votre email d'abord.", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Email de réinitialisation envoyé !");
    } catch (error) {
      console.error("Erreur Reset:", error);
      const message = errorMessages[error.code] || "Impossible d'envoyer l'email.";
      showToast(message, "error");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => Auth.init());



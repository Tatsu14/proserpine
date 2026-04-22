/**
 * UI Manager - Centralisation des composants partagés (Nav, Header, Toast)
 * Évite la duplication de code entre les fichiers HTML.
 */

class UIManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.injectNavbar();
            this.highlightActiveLink();
        });
    }

    injectNavbar() {
        const placeholder = document.getElementById('navbar-placeholder');
        if (!placeholder) return;

        placeholder.innerHTML = `
            <nav id="bottom-nav" role="tablist">
                <a href="accueil.html" class="nav-item" data-page="accueil">
                    <span class="material-symbols-rounded" aria-hidden="true">home</span>
                    <span>Accueil</span>
                </a>
                <a href="astuces.html" class="nav-item" data-page="astuces">
                    <span class="material-symbols-rounded" aria-hidden="true">lightbulb</span>
                    <span>Astuces</span>
                </a>
                <a href="accueil.html" class="nav-item scan-nav-btn" aria-label="Scanner un produit">
                    <div class="scan-nav-circle">
                        <span class="material-symbols-rounded" aria-hidden="true">qr_code_scanner</span>
                    </div>
                </a>
                <a href="guide.html" class="nav-item" data-page="guide">
                    <span class="material-symbols-rounded" aria-hidden="true">import_contacts</span>
                    <span>Guide</span>
                </a>
                <a href="profil.html" class="nav-item" data-page="profil">
                    <span class="material-symbols-rounded" aria-hidden="true">person</span>
                    <span>Profil</span>
                </a>
            </nav>
        `;
    }

    highlightActiveLink() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            if (item.getAttribute('data-page') === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Affiche un message toast professionnel
     * @param {string} message 
     * @param {'success' | 'error'} type 
     */
    showToast(message, type = "success") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "ui-layer";
            document.getElementById('mobile-frame')?.appendChild(container);
        }

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
            toast.style.transform = "translateY(10px)";
            setTimeout(() => {
                toast.remove();
                if (container.children.length === 0) {
                    container.classList.remove('active');
                }
            }, 300);
        }, 3000);
    }
}

export const uiManager = new UIManager();

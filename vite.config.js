import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        accueil: resolve(__dirname, 'src/accueil.html'),
        algorithme: resolve(__dirname, 'src/algorithme.html'),
        astuces: resolve(__dirname, 'src/astuces.html'),
        authentification: resolve(__dirname, 'src/authentification.html'),
        detailsGuide: resolve(__dirname, 'src/details-guide.html'),
        guide: resolve(__dirname, 'src/guide.html'),
        produit: resolve(__dirname, 'src/produit.html'),
        profil: resolve(__dirname, 'src/profil.html'),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Ou l'URL de votre fonction locale
        changeOrigin: true,
      },
    },
  },
});

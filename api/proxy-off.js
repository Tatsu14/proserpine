export default async function handler(req, res) {
  const { barcode, query, fields } = req.query;
  
  // Liste des univers à interroger
  const universes = [
    { name: 'food', domain: 'world.openfoodfacts.org' },
    { name: 'beauty', domain: 'world.openbeautyfacts.org' },
    { name: 'products', domain: 'world.openproductsfacts.org' }
  ];

  try {
    if (barcode) {
      // MODE PRODUIT UNIQUE : On tente chaque univers l'un après l'autre
      for (const uni of universes) {
        const url = `https://${uni.domain}/api/v2/product/${barcode}.json?fields=${fields}`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Proserpine - WebApp - Multi-Source' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 1 || data.status === 'success') {
            data.product.universe = uni.name; // On marque l'univers d'origine
            return res.status(200).json(data);
          }
        }
      }
      return res.status(404).json({ error: 'Produit introuvable dans toutes les bases.' });

    } else if (query) {
      // MODE RECHERCHE : On tente d'abord l'alimentaire, puis les autres si vide
      let allProducts = [];
      
      for (const uni of universes) {
        // Limiter à 4 résultats par univers pour rester rapide
        const url = `https://${uni.domain}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&fields=${fields}&page_size=4&json=1`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Proserpine - WebApp - Multi-Source' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            allProducts = [...allProducts, ...data.products];
          }
        }
        // Si on a déjà assez de résultats (8), on s'arrête
        if (allProducts.length >= 8) break;
      }

      return res.status(200).json({ products: allProducts });
    }

    return res.status(400).json({ error: 'Paramètres manquants' });

  } catch (error) {
    console.error('Multi-Source Proxy Error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur proxy multi-sources' });
  }
}



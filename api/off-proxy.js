// api/off-proxy.js
// Proxy pour éviter les erreurs CORS et identifier l'application auprès d'Open Food Facts

export default async function handler(req, res) {
  const { barcode, query, fields } = req.query;
  
  let url = '';
  if (barcode) {
    // Mode : Détails d'un produit
    url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${fields}`;
  } else if (query) {
    // Mode : Recherche (Utilisation de l'endpoint CGI plus stable)
    url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&fields=${fields}&page_size=8&json=1`;
  } else {
    return res.status(400).json({ error: 'Paramètres manquants (barcode ou query)' });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Proserpine - WebApp - Version 4.0 (Province de Liege)'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erreur provenant d’Open Food Facts' });
    }

    const data = await response.json();
    
    // Ajout d'un header pour confirmer que ça passe par le proxy
    res.setHeader('X-Proxy', 'Vercel-Function');
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Erreur interne du serveur proxy' });
  }
}

/**
 * RÉFÉRENTIEL DE DONNÉES PROSERPINE
 * Contient les dictionnaires de recherche et initialise les moteurs de calcul.
 */

const FallbackDictionary = {
    'verre': { bin: 'Bulle à verre', instruction: 'Vider et retirer le bouchon', icon: 'glass_cup' },
    'plastique': { bin: 'Sac Bleu PMC', instruction: 'Vider, ne pas laisser de restes', icon: 'water_bottle' },
    'carton': { bin: 'Papiers-Cartons', instruction: 'Aplatir et retirer les adhésifs', icon: 'inventory_2' },
    'metal': { bin: 'Sac Bleu PMC', instruction: 'Canettes et conserves vidées', icon: 'liquor' },
    'organique': { bin: 'Sac Vert / Organique', instruction: 'Déchets de cuisine uniquement', icon: 'compost' },
    'piles': { bin: 'Point Bebat', instruction: 'Ne jamais jeter dans les poubelles classiques', icon: 'battery_alert' }
};

// --- INITIALISATION DES MOTEURS ---
// On utilise les classes définies dans scoring_engine.js
window.ProserpineLogic = {
    Calculator: new (window.ProserpineEngine.CalculatorClass)(),
    Impact: new (window.ProserpineEngine.ImpactClass)(),
    Fallback: FallbackDictionary
};

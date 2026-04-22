/**
 * MOTEUR DE CALCUL PROSERPINE - ALGORITHME ACV
 * Logique pure isolée de l'interface et des données.
 */

const EcoScoreMath = {
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
    
    ACV_WEIGHTS: {
        carbon: 0.25,
        water: 0.20,
        biodiversity: 0.20,
        eutrophication: 0.15,
        airQuality: 0.10,
        fossilResources: 0.10
    },

    MODIFIERS: {
        packaging: {
            'BULK': 10,
            'REUSABLE_GLASS': 10,
            'FULLY_RECYCLABLE': 0,
            'PLASTIC_WRAP': -10,
            'NON_RECYCLABLE': -20
        },
        transport: {
            'LOCAL_SHORT_CIRCUIT': 10,
            'TRAIN': 5,
            'ROAD_TRUCK': -5,
            'MARITIME': -5,
            'AIR_FREIGHT': -30
        },
        agriculture: {
            'REGENERATIVE': 15,
            'CERTIFIED_ORGANIC': 10,
            'CONVENTIONAL': -5,
            'INTENSIVE': -15,
            'DEFORESTATION_RISK': -40
        },
        processing: { 
            'UNPROCESSED': 5,
            'PROCESSED': -5,
            'ULTRA_PROCESSED': -20
        }
    }
};

class EcoScoreCalculator {
    calculate(attributes) {
        let baseScore = 
            (attributes.carbonScore * EcoScoreMath.ACV_WEIGHTS.carbon) +
            (attributes.waterScore * EcoScoreMath.ACV_WEIGHTS.water) +
            (attributes.soilBiodiversityScore * EcoScoreMath.ACV_WEIGHTS.biodiversity) +
            (attributes.eutrophicationScore * EcoScoreMath.ACV_WEIGHTS.eutrophication) +
            (attributes.airQualityScore * EcoScoreMath.ACV_WEIGHTS.airQuality) +
            (attributes.fossilResourcesScore * EcoScoreMath.ACV_WEIGHTS.fossilResources);

        let totalModifiers = 0;
        totalModifiers += EcoScoreMath.MODIFIERS.packaging[attributes.packagingType] || 0;
        totalModifiers += EcoScoreMath.MODIFIERS.transport[attributes.transportMode] || 0;
        totalModifiers += EcoScoreMath.MODIFIERS.agriculture[attributes.agriculturePractice] || 0;
        totalModifiers += EcoScoreMath.MODIFIERS.processing[attributes.processingLevel] || 0;

        const clampedModifiers = EcoScoreMath.clamp(totalModifiers, -40, 30);
        const finalScore = baseScore + clampedModifiers;
        return Math.floor(EcoScoreMath.clamp(finalScore, 0, 100));
    }
}

class ImpactEngine {
    constructor() {
        this.RATIOS = {
            'PET': { co2: 2.3, weight: 0.05 },
            'Alu': { co2: 9.0, weight: 0.02 },
            'Carton': { co2: 1.1, weight: 0.1 },
            'Verre': { co2: 0.6, weight: 0.4 },
            'Default': { co2: 0.5, weight: 0.05 }
        };
    }

    calculateSessionImpact(productType) {
        const material = this.RATIOS[productType] || this.RATIOS.Default;
        return {
            co2Saved: material.co2 * material.weight,
            weightSaved: material.weight
        };
    }
}

// Export pour global (avant liaison dans logique.js)
window.ProserpineEngine = {
    CalculatorClass: EcoScoreCalculator,
    ImpactClass: ImpactEngine
};



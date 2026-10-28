// ============================================================================
// src/data/markerNutrientMap.ts
//
// Deterministic clinical mapping between flagged biomarkers and target nutrients.
// Examples:
// - Low Hemoglobin / Low Ferritin -> Prioritize Iron & Vitamin C
// - High LDL / High Total Cholesterol -> Prioritize Soluble Fiber, limit saturated fat
// - High Fasting Glucose / HbA1c -> Prioritize Low GI complex carbs, fiber; limit refined sugars
// - High Triglycerides -> Prioritize Omega-3, fiber; limit refined carbs & sugars
// - Low Vitamin D -> Prioritize Vitamin D & Magnesium
// - Low Vitamin B12 -> Prioritize Vitamin B12 & Cobalamin cofactors
// - High Uric Acid -> Prioritize Vitamin C, hydration; limit purines
// - High SGPT / SGOT -> Prioritize Liver antioxidants (turmeric, choline, cruciferous)
// ============================================================================

import foodsData from './foods.json';

export interface FoodNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  iron: number;
  vitaminC: number;
  calcium: number;
  vitaminD: number;
  vitaminB12: number;
  potassium: number;
  sodium: number;
  magnesium: number;
}

export interface FoodItem {
  id: string;
  name: string;
  hindiName?: string;
  category: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  serving: string;
  veg: boolean;
  vegan: boolean;
  allergens: string[];
  nutrientsPer100g: FoodNutrients;
  primaryNutrients: string[];
  keyIngredients: string[];
  healthBenefits: string;
}

export interface MarkerNutrientTarget {
  markerKey: string;
  markerName: string;
  condition: 'low' | 'high';
  priorityNutrients: string[];
  limitNutrients: string[];
  nutrientDisplay: string[];
  clinicalRationale: string;
  prioritizedFoodIds: string[];
  avoidCategories: string[];
}

export const MARKER_NUTRIENT_RULES: MarkerNutrientTarget[] = [
  {
    markerKey: 'hemoglobin',
    markerName: 'Hemoglobin',
    condition: 'low',
    priorityNutrients: ['iron', 'vitaminC'],
    limitNutrients: ['tannins', 'excessive_calcium_with_meals'],
    nutrientDisplay: ['Bioavailable Iron', 'Vitamin C (absorption enhancer)'],
    clinicalRationale: 'Iron forms the central atom of the heme group in hemoglobin; Vitamin C reduces ferric iron to ferrous iron, increasing intestinal absorption up to 4-fold.',
    prioritizedFoodIds: ['moong_sprout_salad', 'palak_dal_tadka', 'roasted_chana_jaggery', 'amla_ginger_juice', 'chana_masala_quinoa'],
    avoidCategories: ['Tea or coffee consumed during main meals', 'Excessive raw bran'],
  },
  {
    markerKey: 'ferritin',
    markerName: 'Ferritin',
    condition: 'low',
    priorityNutrients: ['iron', 'vitaminC', 'protein'],
    limitNutrients: ['tannins', 'phytates'],
    nutrientDisplay: ['Dietary Iron', 'Vitamin C', 'Foundational Amino Acids'],
    clinicalRationale: 'Replenishing intracellular ferritin iron storage requires dietary iron paired with ascorbic acid and structural protein synthesis.',
    prioritizedFoodIds: ['roasted_chana_jaggery', 'palak_dal_tadka', 'moong_sprout_salad', 'amla_ginger_juice', 'chana_masala_quinoa'],
    avoidCategories: ['Black tea with iron meals', 'Phytate-heavy unsoaked grains'],
  },
  {
    markerKey: 'iron',
    markerName: 'Serum Iron',
    condition: 'low',
    priorityNutrients: ['iron', 'vitaminC'],
    limitNutrients: ['tannins'],
    nutrientDisplay: ['Iron', 'Vitamin C'],
    clinicalRationale: 'Elevates circulating transferrin-bound iron to supply active bone marrow erythropoiesis.',
    prioritizedFoodIds: ['palak_dal_tadka', 'moong_sprout_salad', 'roasted_chana_jaggery', 'amla_ginger_juice'],
    avoidCategories: ['Caffeinated beverages with meals'],
  },
  {
    markerKey: 'ldl_cholesterol',
    markerName: 'LDL Cholesterol',
    condition: 'high',
    priorityNutrients: ['fiber', 'omega3', 'potassium'],
    limitNutrients: ['saturated_fat', 'trans_fat', 'dietary_cholesterol'],
    nutrientDisplay: ['Soluble Beta-Glucan / Pectin', 'Plant Sterols', 'Omega-3 ALA'],
    clinicalRationale: 'Soluble fiber binds bile acids in the intestine, forcing the liver to clear LDL particles from circulation to synthesize new bile.',
    prioritizedFoodIds: ['oats_vegetable_upma', 'flaxseed_chutney_powder', 'rajma_masala_brown_rice', 'soaked_almonds_walnuts', 'bhindi_masala_bajra_roti'],
    avoidCategories: ['Deep-fried foods', 'Hydrogenated oils (Vanaspati)', 'Excessive butter and ghee'],
  },
  {
    markerKey: 'total_cholesterol',
    markerName: 'Total Cholesterol',
    condition: 'high',
    priorityNutrients: ['fiber', 'omega3'],
    limitNutrients: ['saturated_fat', 'trans_fat'],
    nutrientDisplay: ['Viscous Soluble Fiber', 'Lignans', 'Omega-3 ALA'],
    clinicalRationale: 'Viscous fiber slows micelle formation and lowers total apolipoprotein B-carrying lipoproteins.',
    prioritizedFoodIds: ['oats_vegetable_upma', 'flaxseed_chutney_powder', 'rajma_masala_brown_rice', 'soaked_almonds_walnuts'],
    avoidCategories: ['Full-fat commercial sweets', 'Commercial fried snacks (Samosas, Pakoras)'],
  },
  {
    markerKey: 'triglycerides',
    markerName: 'Triglycerides',
    condition: 'high',
    priorityNutrients: ['omega3', 'fiber', 'protein'],
    limitNutrients: ['simple_sugars', 'refined_flour', 'alcohol'],
    nutrientDisplay: ['Marine & Plant Omega-3', 'High Dietary Fiber', 'Complex Carbohydrates'],
    clinicalRationale: 'Reduces hepatic de novo lipogenesis and VLDL triglyceride synthesis while accelerating intravascular triglyceride clearance.',
    prioritizedFoodIds: ['fish_curry_steamed_rice', 'flaxseed_chutney_powder', 'soaked_almonds_walnuts', 'besan_chilla', 'oats_vegetable_upma'],
    avoidCategories: ['Sugar-sweetened beverages', 'Refined maida bakery items', 'Alcohol'],
  },
  {
    markerKey: 'fasting_glucose',
    markerName: 'Fasting Glucose',
    condition: 'high',
    priorityNutrients: ['fiber', 'magnesium', 'protein'],
    limitNutrients: ['refined_sugars', 'high_gi_carbs'],
    nutrientDisplay: ['Low Glycemic Index Complex Carbs', 'Soluble Fiber', 'Magnesium'],
    clinicalRationale: 'Soluble fiber delays carbohydrate absorption, blunting postprandial glucose surges and preserving pancreatic beta-cell sensitivity.',
    prioritizedFoodIds: ['methi_thepla_curd', 'besan_chilla', 'bhindi_masala_bajra_roti', 'chana_masala_quinoa', 'oats_vegetable_upma'],
    avoidCategories: ['Fruit juices with added sugar', 'White bread & refined flour', 'Sweetened desserts'],
  },
  {
    markerKey: 'hba1c',
    markerName: 'HbA1c',
    condition: 'high',
    priorityNutrients: ['fiber', 'magnesium', 'protein'],
    limitNutrients: ['simple_sugars', 'refined_carbs'],
    nutrientDisplay: ['Sustained-Release Fiber', 'Bioactive Fenugreek', 'Magnesium'],
    clinicalRationale: 'Sustained low-glycemic dietary intake reduces cumulative 90-day non-enzymatic erythrocyte glycation.',
    prioritizedFoodIds: ['methi_thepla_curd', 'bhindi_masala_bajra_roti', 'besan_chilla', 'chana_masala_quinoa'],
    avoidCategories: ['High glycemic Indian sweets (Mithai)', 'Refined rice in excess'],
  },
  {
    markerKey: 'vitamin_d',
    markerName: 'Vitamin D',
    condition: 'low',
    priorityNutrients: ['vitaminD', 'calcium', 'magnesium'],
    limitNutrients: [],
    nutrientDisplay: ['Vitamin D3', 'Calcium', 'Magnesium (activation cofactor)'],
    clinicalRationale: 'Magnesium acts as an essential cofactor for the enzymatic conversion of 25(OH)D to active 1,25(OH)2D.',
    prioritizedFoodIds: ['fish_curry_steamed_rice', 'egg_bhurji_multigrain_toast', 'palak_paneer_ragi_roti', 'soaked_almonds_walnuts', 'ragi_porridge_almonds'],
    avoidCategories: ['Excessive unfermented phytic acid'],
  },
  {
    markerKey: 'vitamin_b12',
    markerName: 'Vitamin B12',
    condition: 'low',
    priorityNutrients: ['vitaminB12', 'protein'],
    limitNutrients: [],
    nutrientDisplay: ['Cobalamin (B12)', 'Complete Protein'],
    clinicalRationale: 'Cobalamin serves as an essential coenzyme for methionine synthase in DNA synthesis and neurological maintenance.',
    prioritizedFoodIds: ['fish_curry_steamed_rice', 'egg_bhurji_multigrain_toast', 'chaas_mint_jeera', 'palak_paneer_ragi_roti', 'methi_thepla_curd'],
    avoidCategories: ['Excessive chronic alcohol'],
  },
  {
    markerKey: 'uric_acid',
    markerName: 'Uric Acid',
    condition: 'high',
    priorityNutrients: ['vitaminC', 'potassium', 'fiber'],
    limitNutrients: ['purines', 'fructose', 'red_meat'],
    nutrientDisplay: ['High Vitamin C (uricosuric action)', 'Hydrating Vegetables', 'Low-Purine Foods'],
    clinicalRationale: 'Ascorbic acid competes with uric acid for renal tubule reabsorption, directly promoting renal excretion and reducing urate pools.',
    prioritizedFoodIds: ['amla_ginger_juice', 'masoor_dal_lauki', 'roasted_makhana_turmeric', 'chaas_mint_jeera', 'moong_dal_khichdi'],
    avoidCategories: ['Red meats and organ meats', 'High-fructose corn syrup', 'Beer and yeast extracts'],
  },
  {
    markerKey: 'sgpt_alt',
    markerName: 'SGPT (ALT)',
    condition: 'high',
    priorityNutrients: ['antioxidants', 'choline', 'fiber'],
    limitNutrients: ['deep_fried_fats', 'alcohol', 'refined_sugars'],
    nutrientDisplay: ['Curcumin & Hepatic Antioxidants', 'Glucosinolates', 'Choline'],
    clinicalRationale: 'Cruciferous indoles and curcumin stimulate hepatic Phase II glutathione synthesis and reduce steatosis-induced transaminase leakage.',
    prioritizedFoodIds: ['sarson_ka_saag_makki_roti', 'moong_sprout_salad', 'amla_ginger_juice', 'moong_dal_khichdi', 'masoor_dal_lauki'],
    avoidCategories: ['Heavy deep-fried pakoras/puris', 'Alcohol', 'Commercial trans fats'],
  },
  {
    markerKey: 'sgot_ast',
    markerName: 'SGOT (AST)',
    condition: 'high',
    priorityNutrients: ['antioxidants', 'fiber'],
    limitNutrients: ['alcohol', 'saturated_fats'],
    nutrientDisplay: ['Liver Protective Antioxidants', 'Sulforaphane', 'Hydration'],
    clinicalRationale: 'Supports mitochondrial membrane integrity and downregulates hepatic enzyme leakage.',
    prioritizedFoodIds: ['sarson_ka_saag_makki_roti', 'moong_dal_khichdi', 'amla_ginger_juice', 'masoor_dal_lauki'],
    avoidCategories: ['Alcohol', 'Saturated fat heavy curries'],
  },
  {
    markerKey: 'creatinine',
    markerName: 'Creatinine',
    condition: 'high',
    priorityNutrients: ['fiber', 'potassium_moderation', 'hydration'],
    limitNutrients: ['excessive_animal_protein', 'sodium'],
    nutrientDisplay: ['Light Plant Protein', 'Low Sodium', 'Hydrating Squash'],
    clinicalRationale: 'Light plant proteins decrease renal intraglomerular pressure and nitrogenous waste accumulation.',
    prioritizedFoodIds: ['masoor_dal_lauki', 'moong_dal_khichdi', 'roasted_makhana_turmeric', 'baingan_bharta_jowar_roti'],
    avoidCategories: ['Excessive red meat', 'High-sodium processed snacks', 'Creatine supplements'],
  },
];

/**
 * Validates whether a food item strictly complies with the patient's diet and declared allergies.
 * STRICT SAFETY RULE: Never show or recommend a meal containing a declared allergen!
 */
export function isFoodSafeForUser(
  food: FoodItem,
  dietType?: string,
  userAllergies?: string[]
): boolean {
  const normalizedDiet = (dietType || 'balanced').toLowerCase();
  const allergies = (userAllergies || []).map((a) => a.toLowerCase().trim()).filter(Boolean);

  // 1. Dietary Preference Check
  if (normalizedDiet === 'vegan' && !food.vegan) {
    return false;
  }
  if ((normalizedDiet === 'veg' || normalizedDiet === 'vegetarian') && !food.veg) {
    return false;
  }

  // 2. Strict Allergen Validation
  if (allergies.length > 0) {
    // Check declared allergen tags on the food
    const foodAllergens = (food.allergens || []).map((a) => a.toLowerCase());
    for (const allergy of allergies) {
      if (foodAllergens.some((fa) => fa.includes(allergy) || allergy.includes(fa))) {
        return false;
      }
    }

    // Check ingredients list for allergen keywords
    const ingredientsLower = food.keyIngredients.map((i) => i.toLowerCase()).join(' ');
    const foodNameLower = food.name.toLowerCase();

    for (const allergy of allergies) {
      // Common allergen keyword mapping
      if (allergy === 'dairy' || allergy === 'milk' || allergy === 'lactose') {
        if (
          foodAllergens.includes('dairy') ||
          ingredientsLower.includes('milk') ||
          ingredientsLower.includes('curd') ||
          ingredientsLower.includes('paneer') ||
          ingredientsLower.includes('ghee') ||
          ingredientsLower.includes('butter') ||
          ingredientsLower.includes('cheese') ||
          foodNameLower.includes('paneer') ||
          foodNameLower.includes('curd')
        ) {
          return false;
        }
      }

      if (allergy === 'gluten' || allergy === 'wheat') {
        if (
          foodAllergens.includes('gluten') ||
          ingredientsLower.includes('wheat') ||
          ingredientsLower.includes('maida') ||
          ingredientsLower.includes('suji') ||
          ingredientsLower.includes('thepla') ||
          ingredientsLower.includes('bread') ||
          ingredientsLower.includes('toast')
        ) {
          return false;
        }
      }

      if (allergy === 'nuts' || allergy === 'peanuts' || allergy === 'tree nuts') {
        if (
          foodAllergens.includes('nuts') ||
          foodAllergens.includes('peanuts') ||
          ingredientsLower.includes('peanut') ||
          ingredientsLower.includes('almond') ||
          ingredientsLower.includes('walnut') ||
          ingredientsLower.includes('cashew') ||
          foodNameLower.includes('almond') ||
          foodNameLower.includes('walnut') ||
          foodNameLower.includes('peanut')
        ) {
          return false;
        }
      }

      if (allergy === 'soy' || allergy === 'soya') {
        if (
          foodAllergens.includes('soy') ||
          ingredientsLower.includes('tofu') ||
          ingredientsLower.includes('soy') ||
          ingredientsLower.includes('soya') ||
          foodNameLower.includes('tofu')
        ) {
          return false;
        }
      }

      if (allergy === 'eggs' || allergy === 'egg') {
        if (
          foodAllergens.includes('eggs') ||
          ingredientsLower.includes('egg') ||
          foodNameLower.includes('egg')
        ) {
          return false;
        }
      }

      if (allergy === 'fish' || allergy === 'seafood') {
        if (
          foodAllergens.includes('fish') ||
          ingredientsLower.includes('fish') ||
          foodNameLower.includes('fish')
        ) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Returns all foods from foods.json filtered strictly by diet and allergies.
 */
export function getSafeFoods(dietType?: string, userAllergies?: string[]): FoodItem[] {
  const allFoods = (foodsData.foods as unknown) as FoodItem[];
  return allFoods.filter((f) => isFoodSafeForUser(f, dietType, userAllergies));
}

/**
 * Finds nutrient targeting rules matching a list of flagged biomarkers.
 */
export function getNutrientRulesForBiomarkers(
  flaggedMarkers: Array<{ biomarkerKey: string; status: string; value: number }>
): MarkerNutrientTarget[] {
  const matchingRules: MarkerNutrientTarget[] = [];

  for (const marker of flaggedMarkers) {
    const key = marker.biomarkerKey.toLowerCase();
    const status = marker.status.toLowerCase();
    const isFlagged = status !== 'normal';
    if (!isFlagged) continue;

    const rule = MARKER_NUTRIENT_RULES.find(
      (r) =>
        r.markerKey === key &&
        (status === 'abnormal' ||
          status === 'borderline' ||
          status === 'flagged' ||
          r.condition === status)
    );
    if (rule) {
      matchingRules.push(rule);
    }
  }

  return matchingRules;
}

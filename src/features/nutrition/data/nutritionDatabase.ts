export type DietType =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'low_carb';

export interface FoodItem {
  id: string;
  name: string;
  category: 'leafy_greens' | 'legumes' | 'seeds_nuts' | 'marine' | 'poultry_meat' | 'fruits' | 'fermented' | 'spices_herbs' | 'roots';
  servingsAdvice: string;
  keyNutrients: string[];
  therapeuticTarget: string;
  dietSuitability: DietType[];
  synergyTip: string;
  cautions?: string;
}

export interface NutrientSynergyRule {
  targetNutrient: string;
  enhancer: string;
  enhancerFoods: string[];
  inhibitor: string;
  inhibitorFoods: string[];
  clinicalMechanism: string;
}

export const NUTRIENT_SYNERGY_RULES: NutrientSynergyRule[] = [
  {
    targetNutrient: 'Non-Heme Plant Iron',
    enhancer: 'Ascorbic Acid (Vitamin C)',
    enhancerFoods: ['Bell peppers', 'Fresh lemon juice', 'Strawberries', 'Kiwi', 'Broccoli florets'],
    inhibitor: 'Polyphenols & Phytates',
    inhibitorFoods: ['Black tea', 'Espresso', 'Coffee', 'Raw oat bran', 'Unsoaked wheat bran'],
    clinicalMechanism: 'Vitamin C reduces ferric (Fe3+) iron to ferrous (Fe2+) state, increasing gut mucosal transport by up to 300%. Tannins in tea chelate iron, blocking enterocyte binding.',
  },
  {
    targetNutrient: 'Fat-Soluble Vitamin D3',
    enhancer: 'Lipids & Vitamin K2 (MK-7)',
    enhancerFoods: ['Extra virgin olive oil', 'Avocado', 'Egg yolks', 'Natto / fermented foods'],
    inhibitor: 'Depleted Magnesium Cofactors',
    inhibitorFoods: ['High refined sugar diets', 'Excess alcohol consumption'],
    clinicalMechanism: 'All enzymes metabolizing Vitamin D require hepatic and renal magnesium as a functional cofactor. Lipids stimulate bile salt secretion necessary for micellar uptake.',
  },
  {
    targetNutrient: 'Glucose & Insulin Sensitivity',
    enhancer: 'Soluble Viscous Gel & Acetic Acid',
    enhancerFoods: ['Chia seeds', 'Apple cider vinegar', 'Ground flaxseed', 'Steel-cut oats'],
    inhibitor: 'Rapid-digesting Refined Starches',
    inhibitorFoods: ['White toast', 'Soda/fruit juices', 'Mashed instant potatoes'],
    clinicalMechanism: 'Beta-glucans and viscous soluble fiber slow gastric emptying rate, blunting postprandial glucose surges by 35% and mitigating insulin spikes.',
  },
  {
    targetNutrient: 'Cardiometabolic LDL Regulation',
    enhancer: 'Phytosterols & Marine Omega-3 (EPA/DHA)',
    enhancerFoods: ['Wild salmon', 'Sardines', 'Raw walnuts', 'Psyllium seed husk', 'Artichoke'],
    inhibitor: 'Industrial Oxidized Saturated & Trans Fats',
    inhibitorFoods: ['Commercial deep fryer oils', 'Processed deli sausages', 'Packaged pastries'],
    clinicalMechanism: 'Soluble fiber binds bile acids in the distal ileum, prompting hepatic conversion of excess circulating cholesterol into new bile salts.',
  },
];

export const NUTRITION_DATABASE: FoodItem[] = [
  {
    id: 'wild_salmon',
    name: 'Wild Alaskan Salmon',
    category: 'marine',
    servingsAdvice: '3-4 oz, 2-3 times per week',
    keyNutrients: ['Omega-3 (EPA/DHA)', 'Vitamin D3', 'Vitamin B12', 'Selenium'],
    therapeuticTarget: 'Elevates HDL, drops triglycerides, supports cellular membrane fluidity and Vitamin D levels.',
    dietSuitability: ['omnivore', 'pescatarian', 'low_carb'],
    synergyTip: 'Serve with steamed dark greens tossed in extra virgin olive oil and lemon.',
  },
  {
    id: 'sprouted_lentils',
    name: 'Sprouted Brown & Green Lentils',
    category: 'legumes',
    servingsAdvice: '1/2 to 3/4 cup cooked daily',
    keyNutrients: ['Non-heme Iron', 'Folate (B9)', 'Soluble Prebiotic Fiber', 'Potassium'],
    therapeuticTarget: 'Rebuilds iron stores, stabilizes blood glucose response, feeds gut microbiome.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
    synergyTip: 'Drizzle with freshly squeezed lemon juice or toss with roasted red bell peppers for optimal iron absorption.',
  },
  {
    id: 'chia_seeds',
    name: 'Hydrated Chia Seeds',
    category: 'seeds_nuts',
    servingsAdvice: '1-2 tablespoons soaked in almond milk or water daily',
    keyNutrients: ['Soluble Gel Fiber', 'Alpha-Linolenic Acid (ALA)', 'Magnesium', 'Calcium'],
    therapeuticTarget: 'Blunts post-prandial glycemic excursions, promotes smooth bowel transit, binds excess cholesterol.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Soak for at least 15 minutes before consuming to activate the mucilaginous soluble fiber matrix.',
  },
  {
    id: 'steamed_spinach',
    name: 'Steamed Baby Spinach & Swiss Chard',
    category: 'leafy_greens',
    servingsAdvice: '1-2 cups cooked 3-4 times per week',
    keyNutrients: ['Magnesium', 'Folate', 'Lutein', 'Potassium'],
    therapeuticTarget: 'Calms neuro-muscular excitability, lowers arterial tone, replenishes cellular magnesium.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Light steaming reduces oxalates by 30-40%, greatly freeing up bound magnesium and iron for absorption.',
  },
  {
    id: 'nutritional_yeast',
    name: 'Fortified Nutritional Yeast Flakes',
    category: 'fermented',
    servingsAdvice: '1 tablespoon sprinkled on salads, soups, or avocado toast daily',
    keyNutrients: ['Vitamin B12', 'B-Complex (B1, B2, B3, B6)', 'Beta-Glucan'],
    therapeuticTarget: 'Crucial plant-based neurological support, energy metabolism, and homocysteine regulation.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
    synergyTip: 'Add at the end of cooking so high heat does not degrade heat-sensitive B-vitamins.',
  },
  {
    id: 'raw_pumpkin_seeds',
    name: 'Raw Sprouted Pumpkin Seeds (Pepitas)',
    category: 'seeds_nuts',
    servingsAdvice: '1-2 tablespoons (approx 20g) as mid-day snack',
    keyNutrients: ['Magnesium', 'Zinc', 'Non-heme Iron', 'Plant Phytosterols'],
    therapeuticTarget: 'Immune signaling, prostate and metabolic support, muscle relaxation.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Consume raw or gently lightly dry-toasted to keep sensitive polyunsaturated fats unoxidized.',
  },
  {
    id: 'wild_blueberries',
    name: 'Organic Wild Blueberries',
    category: 'fruits',
    servingsAdvice: '1/2 cup fresh or frozen daily',
    keyNutrients: ['Anthocyanins', 'Resveratrol', 'Vitamin C', 'Polyphenols'],
    therapeuticTarget: 'Vascular endothelial protection, lowering hs-CRP inflammation, insulin sensitivity.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Pair with unsweetened Greek yogurt or coconut kefir for symbiotic gut barrier reinforcement.',
  },
  {
    id: 'extra_virgin_olive_oil',
    name: 'Cold-Pressed Extra Virgin Olive Oil',
    category: 'roots',
    servingsAdvice: '1-2 tablespoons raw over meals daily',
    keyNutrients: ['Oleic Acid (MUFA)', 'Oleocanthal', 'Vitamin E'],
    therapeuticTarget: 'Preserves HDL cholesterol quality, protects LDL against atherogenic oxidation.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Add raw as a finishing oil over warm food rather than smoking it at high searing temperatures.',
  },
  {
    id: 'tempeh',
    name: 'Fermented Organic Tempeh',
    category: 'fermented',
    servingsAdvice: '3-4 oz, 2-3 times per week',
    keyNutrients: ['Bioavailable Protein', 'Prebiotic Isoflavones', 'Non-heme Iron', 'Trace B12'],
    therapeuticTarget: 'Whole-food plant protein that maintains glycemic stability and promotes gut microbial diversity.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
    synergyTip: 'Marinate in tamari, garlic, and freshly squeezed orange/lime juice for an iron-boosting meal.',
  },
  {
    id: 'cremini_mushrooms',
    name: 'Sun-Exposed Cremini / Shiitake Mushrooms',
    category: 'roots',
    servingsAdvice: '1 cup sautéed 2-3 times per week',
    keyNutrients: ['Ergocalciferol (Vitamin D2)', 'Copper', 'Selenium', 'Beta-Glucan'],
    therapeuticTarget: 'Immune cell priming, natural micronutrient delivery, antioxidant defense.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Place sliced mushrooms in direct sunlight for 20 minutes before cooking to naturally boost Vitamin D content.',
  },
  {
    id: 'broccoli_sprouts',
    name: 'Fresh Broccoli Sprouts',
    category: 'leafy_greens',
    servingsAdvice: '1/4 cup raw on wraps or bowls daily',
    keyNutrients: ['Sulforaphane', 'Glucoraphanin', 'Vitamin C'],
    therapeuticTarget: 'Phase II liver enzyme activation, supporting hepatic ALT/AST detoxification pathways.',
    dietSuitability: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'low_carb'],
    synergyTip: 'Eat raw or lightly blended; the heat-sensitive myrosinase enzyme is required to create sulforaphane.',
  },
  {
    id: 'pastured_eggs',
    name: 'Pasture-Raised Organic Whole Eggs',
    category: 'poultry_meat',
    servingsAdvice: '2 whole eggs, 3-5 days per week',
    keyNutrients: ['Choline', 'Lutein & Zeaxanthin', 'Vitamin D', 'Vitamin B12'],
    therapeuticTarget: 'Hepatic lipid export (via phosphatidylcholine), eye health, and neurocognitive methylation.',
    dietSuitability: ['omnivore', 'vegetarian', 'pescatarian', 'low_carb'],
    synergyTip: 'Poach or soft-boil to keep yolk cholesterol unoxidized while retaining bioactive choline.',
  },
];

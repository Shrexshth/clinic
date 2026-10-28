import { BiomarkerEvaluation } from '../../analyzer/types/biomarker';
import {
  DietType,
  FoodItem,
  NUTRITION_DATABASE,
  NUTRIENT_SYNERGY_RULES,
  NutrientSynergyRule,
} from '../data/nutritionDatabase';

export interface DailyMealSuggestion {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Functional Snack';
  title: string;
  description: string;
  targetBenefits: string;
  keyIngredients: string[];
}

export interface NutritionPlan {
  dietType: DietType;
  focusAreas: string[];
  priorityFoods: FoodItem[];
  foodsToLimit: { item: string; reason: string; relatedMarkers: string[] }[];
  dailyMealPlan: DailyMealSuggestion[];
  applicableSynergies: NutrientSynergyRule[];
  doctorDiscussionQuestions: string[];
}

/**
 * Deterministically generates a personalized nutrition plan based on lab evaluations
 * and user dietary preferences. Never uses an LLM.
 */
export function generateNutritionPlan(
  evaluations: BiomarkerEvaluation[],
  dietType: DietType = 'omnivore'
): NutritionPlan {
  const abnormalEvaluations = evaluations.filter((e) => e.isAbnormal || e.status.includes('borderline'));

  const focusAreasSet = new Set<string>();
  const biomarkerIds = new Set(abnormalEvaluations.map((e) => e.rule.id));

  // Determine focus areas
  if (biomarkerIds.has('hemoglobin') || biomarkerIds.has('ferritin') || biomarkerIds.has('hematocrit')) {
    focusAreasSet.add('Rebuild Iron Stores & Oxygen Capacity');
  }
  if (biomarkerIds.has('fasting_glucose') || biomarkerIds.has('hba1c')) {
    focusAreasSet.add('Glycemic Stability & Insulin Sensitivity');
  }
  if (
    biomarkerIds.has('total_cholesterol') ||
    biomarkerIds.has('ldl_cholesterol') ||
    biomarkerIds.has('triglycerides') ||
    biomarkerIds.has('hdl_cholesterol')
  ) {
    focusAreasSet.add('Cardiometabolic & Lipid Particle Regulation');
  }
  if (biomarkerIds.has('vitamin_d') || biomarkerIds.has('vitamin_b12') || biomarkerIds.has('magnesium')) {
    focusAreasSet.add('Micronutrient & Neurological Optimization');
  }
  if (biomarkerIds.has('alt_sgpt') || biomarkerIds.has('ast_sgot') || biomarkerIds.has('creatinine') || biomarkerIds.has('egfr')) {
    focusAreasSet.add('Hepatic Detoxification & Renal Support');
  }
  if (biomarkerIds.has('tsh') || biomarkerIds.has('hs_crp')) {
    focusAreasSet.add('Systemic Anti-Inflammatory Baseline');
  }

  // Fallback if all markers are optimal
  if (focusAreasSet.size === 0) {
    focusAreasSet.add('Longevity, Mitochondrial Vitality & Maintenance');
  }

  // Filter foods suitable for user diet
  const dietFilteredFoods = NUTRITION_DATABASE.filter((food) =>
    food.dietSuitability.includes(dietType)
  );

  // Score foods based on matching abnormal targets
  const prioritizedFoods = [...dietFilteredFoods].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    for (const ev of abnormalEvaluations) {
      for (const target of ev.rule.foodsToPrioritize) {
        if (a.name.toLowerCase().includes(target.toLowerCase())) scoreA += 3;
        if (b.name.toLowerCase().includes(target.toLowerCase())) scoreB += 3;
      }
    }
    return scoreB - scoreA;
  });

  // Foods to limit / moderate
  const foodsToLimit: { item: string; reason: string; relatedMarkers: string[] }[] = [];

  if (biomarkerIds.has('fasting_glucose') || biomarkerIds.has('hba1c')) {
    foodsToLimit.push({
      item: 'Refined Flours & High-Glycemic Sweets',
      reason: 'Triggers rapid post-prandial blood sugar surges that overburden pancreatic beta cells.',
      relatedMarkers: ['Fasting Glucose', 'HbA1c'],
    });
    foodsToLimit.push({
      item: 'Liquid Sugars & Commercial Fruit Juices',
      reason: 'Absorbed in minutes without fiber, causing immediate insulin spikes and liver fat accumulation.',
      relatedMarkers: ['HbA1c', 'Triglycerides'],
    });
  }

  if (biomarkerIds.has('triglycerides') || biomarkerIds.has('ldl_cholesterol')) {
    foodsToLimit.push({
      item: 'Industrial Trans-Fats & Reheated Seed Oils',
      reason: 'Promotes formation of oxidized LDL particles and impairs reverse cholesterol clearance.',
      relatedMarkers: ['LDL Cholesterol', 'Triglycerides'],
    });
    foodsToLimit.push({
      item: 'Alcohol and High-Sugar Cocktails',
      reason: 'Stimulates immediate hepatic triglyceride synthesis and delays liver fat oxidation.',
      relatedMarkers: ['Triglycerides', 'ALT (SGPT)'],
    });
  }

  if (biomarkerIds.has('ferritin') || biomarkerIds.has('hemoglobin')) {
    foodsToLimit.push({
      item: 'Black Tea & Coffee with Meals',
      reason: 'Tannins and chlorogenic acids bond to non-heme iron in the stomach, reducing absorption by up to 60%.',
      relatedMarkers: ['Ferritin', 'Hemoglobin'],
    });
  }

  if (biomarkerIds.has('alt_sgpt') || biomarkerIds.has('ast_sgot')) {
    foodsToLimit.push({
      item: 'Ultra-Processed Foods with High-Fructose Corn Syrup',
      reason: 'Fructose is metabolized exclusively by hepatocytes, accelerating hepatic de novo lipogenesis.',
      relatedMarkers: ['ALT (SGPT)', 'AST (SGOT)'],
    });
  }

  // Default healthy limit if none flagged
  if (foodsToLimit.length === 0) {
    foodsToLimit.push({
      item: 'Ultra-Processed Packaged Snacks',
      reason: 'Contains oxidized vegetable oils and artificial stabilizers that heighten baseline vascular stress.',
      relatedMarkers: ['Maintenance'],
    });
  }

  // Applicable Synergies
  const applicableSynergies = NUTRIENT_SYNERGY_RULES.filter((rule) => {
    if (rule.targetNutrient.includes('Iron') && (biomarkerIds.has('ferritin') || biomarkerIds.has('hemoglobin'))) return true;
    if (rule.targetNutrient.includes('Vitamin D') && biomarkerIds.has('vitamin_d')) return true;
    if (rule.targetNutrient.includes('Glucose') && (biomarkerIds.has('fasting_glucose') || biomarkerIds.has('hba1c'))) return true;
    if (rule.targetNutrient.includes('Cardiometabolic') && (biomarkerIds.has('ldl_cholesterol') || biomarkerIds.has('triglycerides'))) return true;
    return false;
  });

  // If none matched, include the top 2 general synergies
  const finalSynergies = applicableSynergies.length > 0 ? applicableSynergies : NUTRIENT_SYNERGY_RULES.slice(0, 2);

  // Build Tailored Meal Plan
  const dailyMealPlan: DailyMealSuggestion[] = buildMealPlan(dietType, biomarkerIds);

  // Doctor discussion questions
  const doctorDiscussionQuestions = buildDoctorQuestions(abnormalEvaluations);

  return {
    dietType,
    focusAreas: Array.from(focusAreasSet),
    priorityFoods: prioritizedFoods.slice(0, 6),
    foodsToLimit,
    dailyMealPlan,
    applicableSynergies: finalSynergies,
    doctorDiscussionQuestions,
  };
}

function buildMealPlan(dietType: DietType, abnormalIds: Set<string>): DailyMealSuggestion[] {
  const isVegan = dietType === 'vegan';
  const isVegetarian = dietType === 'vegetarian' || isVegan;
  const hasMetabolic = abnormalIds.has('fasting_glucose') || abnormalIds.has('hba1c') || abnormalIds.has('triglycerides');
  const hasIronDeficit = abnormalIds.has('ferritin') || abnormalIds.has('hemoglobin');

  // Breakfast
  let breakfast: DailyMealSuggestion;
  if (isVegan) {
    breakfast = {
      mealType: 'Breakfast',
      title: 'Warm Cinnamon Steel-Cut Oats with Chia & Pumpkin Seeds',
      description: 'Slow-simmered steel-cut oats topped with hydrated chia seeds, raw pumpkin seeds, fresh blueberries, and Ceylon cinnamon.',
      targetBenefits: hasMetabolic
        ? 'Viscous beta-glucans stabilize glucose response and deliver essential magnesium.'
        : 'Rich in plant-based iron, zinc, and sustained clean morning energy.',
      keyIngredients: ['Steel-cut oats', 'Chia seeds', 'Pumpkin seeds', 'Blueberries', 'Ceylon cinnamon'],
    };
  } else if (hasMetabolic) {
    breakfast = {
      mealType: 'Breakfast',
      title: 'Pastured Scramble with Sautéed Spinach & Avocado',
      description: 'Two soft-scrambled pasture eggs in extra virgin olive oil with steamed baby spinach, sliced Haas avocado, and pumpkin seeds.',
      targetBenefits: 'Zero-sugar, high-protein morning foundation that keeps post-prandial blood glucose flat.',
      keyIngredients: ['Pastured eggs', 'Baby spinach', 'Avocado', 'Olive oil', 'Pumpkin seeds'],
    };
  } else {
    breakfast = {
      mealType: 'Breakfast',
      title: 'Greek Yogurt Vitality Bowl with Berries & Hemp Seeds',
      description: 'Unsweetened whole milk Greek yogurt with organic wild blueberries, sprouted hemp seeds, and a dash of raw cacao.',
      targetBenefits: 'Supplies bioavailable B12, bioactive calcium, and polyphenols to start the day.',
      keyIngredients: ['Greek yogurt', 'Wild blueberries', 'Hemp hearts', 'Raw cacao'],
    };
  }

  // Lunch
  let lunch: DailyMealSuggestion;
  if (hasIronDeficit) {
    lunch = {
      mealType: 'Lunch',
      title: isVegetarian
        ? 'Lemon-Tahini Sprouted Lentil & Rainbow Bell Pepper Bowl'
        : 'Citrus Wild Salmon with Steamed Quinoa & Dark Greens',
      description: isVegetarian
        ? 'Warm cooked brown lentils tossed with diced red bell peppers, cucumber, steamed Swiss chard, and a vibrant lemon-tahini dressing.'
        : 'Pan-seared Alaskan wild salmon over warm quinoa, baby arugula, and roasted sweet peppers with lemon.',
      targetBenefits: 'Combines bioavailable non-heme iron with high-potency Vitamin C (lemon + bell peppers) for up to 3x absorption.',
      keyIngredients: isVegetarian
        ? ['Sprouted lentils', 'Red bell peppers', 'Tahini', 'Swiss chard', 'Lemon juice']
        : ['Wild salmon', 'Quinoa', 'Arugula', 'Bell pepper', 'Lemon'],
    };
  } else {
    lunch = {
      mealType: 'Lunch',
      title: isVegetarian
        ? 'Mediterranean Chickpea & Kalamata Olive Salad'
        : 'Olive Oil Grilled Sardine or Salmon Mezze Bowl',
      description: 'Mixed baby greens, crunchy cucumbers, artichoke hearts, kalamata olives, and fresh parsley tossed in cold-pressed olive oil.',
      targetBenefits: 'Delivers anti-inflammatory monounsaturated fats (MUFA) and soluble fiber for healthy lipid balance.',
      keyIngredients: ['Mixed greens', 'Artichoke hearts', 'Kalamata olives', 'Extra virgin olive oil', 'Parsley'],
    };
  }

  // Dinner
  let dinner: DailyMealSuggestion;
  if (isVegetarian) {
    dinner = {
      mealType: 'Dinner',
      title: 'Ginger-Turmeric Tempeh Stir-Fry with Steamed Broccoli',
      description: 'Cubed organic fermented tempeh stir-fried with fresh ginger root, turmeric, broccoli florets, and shiitake mushrooms.',
      targetBenefits: 'Fermentation enhances protein digestibility; ginger and turmeric calm systemic inflammation and support liver ALT.',
      keyIngredients: ['Organic tempeh', 'Broccoli', 'Shiitake mushrooms', 'Ginger', 'Turmeric'],
    };
  } else {
    dinner = {
      mealType: 'Dinner',
      title: 'Herb-Roasted Cod or Pasture Chicken with Roasted Root Veggies',
      description: 'Wild white cod or pasture-raised poultry breast roasted with garlic, rosemary, steamed Brussels sprouts, and roasted beets.',
      targetBenefits: 'Delivers lean bioavailable amino acids for overnight tissue repair without spiking evening blood glucose.',
      keyIngredients: ['Wild cod or chicken', 'Brussels sprouts', 'Garlic', 'Rosemary', 'Beets'],
    };
  }

  // Snack
  const snack: DailyMealSuggestion = {
    mealType: 'Functional Snack',
    title: 'Sprouted Pepitas & 85% Dark Cacao Square',
    description: 'A handful of lightly toasted pumpkin seeds paired with a square of single-origin 85% dark chocolate.',
    targetBenefits: 'Delivers concentrated dietary magnesium (approx 150mg) and copper to support evening neuro-relaxation.',
    keyIngredients: ['Pumpkin seeds (pepitas)', '85% Dark cacao'],
  };

  return [breakfast, lunch, dinner, snack];
}

function buildDoctorQuestions(abnormals: BiomarkerEvaluation[]): string[] {
  if (abnormals.length === 0) {
    return [
      'My blood markers are currently in optimal range. What is an ideal testing interval to maintain this baseline?',
      'Are there any advanced longevity or cardiovascular markers (e.g., ApoB, Lp(a), Fasting Insulin) you recommend adding in my next checkup?',
    ];
  }

  const questions: string[] = [];

  for (const ev of abnormals) {
    if (ev.rule.id === 'ferritin' && (ev.status === 'low' || ev.status === 'critical_low')) {
      questions.push(
        `My Serum Ferritin is ${ev.value} ${ev.rule.unit} (standard optimal is 50-150). Do you recommend oral iron bisglycinate or further investigation into absorption?`
      );
    }
    if (ev.rule.id === 'vitamin_d' && (ev.status === 'low' || ev.status === 'critical_low')) {
      questions.push(
        `My Vitamin D (25-OH) is ${ev.value} ng/mL. Would a short-term clinical titration (e.g. 4,000-5,000 IU/day with K2) be appropriate for me?`
      );
    }
    if (ev.rule.id === 'vitamin_b12' && (ev.status === 'low' || ev.status === 'borderline_low')) {
      questions.push(
        `My Vitamin B12 is ${ev.value} pg/mL. Would a sublingual methylcobalamin form be preferred to support neurological reserves?`
      );
    }
    if (ev.rule.id === 'hba1c' && ev.status.includes('high')) {
      questions.push(
        `My HbA1c is ${ev.value}%. Should we test fasting insulin or a continuous glucose monitor (CGM) to evaluate metabolic flexibility?`
      );
    }
    if (ev.rule.id === 'triglycerides' && ev.status.includes('high')) {
      questions.push(
        `My Triglycerides are ${ev.value} mg/dL. Would high-EPA pharmaceutical-grade fish oil be a beneficial addition alongside dietary changes?`
      );
    }
    if (ev.rule.id === 'alt_sgpt' && ev.status.includes('high')) {
      questions.push(
        `My ALT liver enzyme is elevated at ${ev.value} U/L. Should we schedule a routine follow-up liver ultrasound or repeat in 8 weeks?`
      );
    }
  }

  // Ensure at least 2 questions
  if (questions.length === 1) {
    questions.push('What is the recommended re-test timeframe to assess how my lifestyle and nutrition changes are progressing?');
  }

  return questions;
}

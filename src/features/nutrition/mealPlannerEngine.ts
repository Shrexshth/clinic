// ============================================================================
// src/features/nutrition/mealPlannerEngine.ts
//
// 7-day personalized meal planner engine based on Indian foods.json.
// Strictly validates every meal against user's diet type and declared allergens.
// SAFETY GUARANTEE: Never show or output a meal containing a declared allergen.
// Supports:
// - Dynamic 7-day plan generation prioritized by flagged biomarkers
// - Meal swapping with safe alternatives from foods.json
// - Mark-eaten status tracking
// - Combined, categorized grocery list aggregation across all 7 days
// ============================================================================

import { DayMealPlan, GroceryItem, Meal } from '@/data/mock';
import foodsData from '@/data/foods.json';
import {
  FoodItem,
  getNutrientRulesForBiomarkers,
  getSafeFoods,
  isFoodSafeForUser,
} from '@/data/markerNutrientMap';

export interface UserDemographicProfile {
  diet_type?: string;
  diet?: string;
  allergies?: string[];
  age?: number;
  sex?: string;
}

export interface BiomarkerInput {
  biomarkerKey: string;
  status: string;
  value: number;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Converts a FoodItem from foods.json into a structured Meal object.
 */
function foodItemToMeal(food: FoodItem, day: string, index: number): Meal {
  return {
    id: `meal_${day.toLowerCase()}_${food.mealType}_${food.id}_${index}`,
    type: food.mealType,
    title: food.name,
    calories: Math.round(food.nutrientsPer100g.calories * 1.5),
    protein: `${(food.nutrientsPer100g.protein * 1.5).toFixed(1)}g`,
    carbs: `${(food.nutrientsPer100g.carbs * 1.5).toFixed(1)}g`,
    fats: `${(food.nutrientsPer100g.fats * 1.5).toFixed(1)}g`,
    isEaten: false,
    description: food.healthBenefits,
    targetNutrients: food.primaryNutrients,
    keyIngredients: food.keyIngredients,
  };
}

/**
 * Generates a full 7-day meal plan drawn ONLY from foods.json,
 * tailored to flagged biomarkers and strictly excluding any declared allergen.
 */
export function generate7DayMealPlan(
  flaggedBiomarkers: BiomarkerInput[],
  profile: UserDemographicProfile
): DayMealPlan[] {
  const userDiet = profile.diet_type || profile.diet || 'balanced';
  const userAllergies = profile.allergies || [];

  // 1. Get all safe foods filtered by diet and allergies
  const safeFoods = getSafeFoods(userDiet, userAllergies);

  // Group safe foods by meal type
  const breakfasts = safeFoods.filter((f) => f.mealType === 'breakfast');
  const lunches = safeFoods.filter((f) => f.mealType === 'lunch');
  const dinners = safeFoods.filter((f) => f.mealType === 'dinner');
  const snacks = safeFoods.filter((f) => f.mealType === 'snack');

  // Fallbacks if a specific meal type is sparse after allergen exclusions: use only verified safe foods
  const safeAny = safeFoods;

  const safeBreakfasts = breakfasts.length > 0 ? breakfasts : safeAny;
  const safeLunches = lunches.length > 0 ? lunches : safeAny;
  const safeDinners = dinners.length > 0 ? dinners : safeAny;
  const safeSnacks = snacks.length > 0 ? snacks : safeAny;

  // 2. Identify prioritized food IDs from flagged biomarkers
  const nutrientRules = getNutrientRulesForBiomarkers(flaggedBiomarkers);
  const prioritizedFoodIds = new Set<string>();
  for (const rule of nutrientRules) {
    for (const id of rule.prioritizedFoodIds) {
      prioritizedFoodIds.add(id);
    }
  }

  // Helper to pick a prioritized food if available, cycling through options
  const pickFood = (pool: FoodItem[], dayIndex: number): FoodItem | null => {
    if (!pool || pool.length === 0) return null;
    // Check if any prioritized food is in the pool and safe
    const prioritizedInPool = pool.filter((f) => prioritizedFoodIds.has(f.id));
    if (prioritizedInPool.length > 0 && dayIndex % 2 === 0) {
      return prioritizedInPool[dayIndex % prioritizedInPool.length];
    }
    return pool[dayIndex % pool.length];
  };

  const today = new Date();
  const dayPlans: DayMealPlan[] = [];

  // 3. Build each of the 7 days
  for (let i = 0; i < 7; i++) {
    const day = DAYS_OF_WEEK[i];
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() + i);
    const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const breakfastFood = pickFood(safeBreakfasts, i);
    const lunchFood = pickFood(safeLunches, i + 1);
    const snackFood = pickFood(safeSnacks, i + 2);
    const dinnerFood = pickFood(safeDinners, i + 3);

    const candidateMeals: (FoodItem | null)[] = [breakfastFood, lunchFood, snackFood, dinnerFood];
    const meals: Meal[] = [];

    candidateMeals.forEach((food, idx) => {
      if (food) {
        meals.push(foodItemToMeal(food, day, idx + 1));
      }
    });

    // Final safety verification: Ensure NO meal contains declared allergens
    const verifiedMeals = meals.filter((meal) => {
      // Find underlying food
      const rawFood = (foodsData.foods as FoodItem[]).find((f) => f.name === meal.title);
      if (!rawFood) return true;
      return isFoodSafeForUser(rawFood, userDiet, userAllergies);
    });

    dayPlans.push({
      day,
      dateLabel,
      meals: verifiedMeals,
    });
  }

  return dayPlans;
}

/**
 * Swaps a specific meal with an alternative food from foods.json.
 * Guarantees that the replacement strictly respects diet and allergens.
 */
export function swapMealWithSafeAlternative(
  meal: Meal,
  day: string,
  profile: UserDemographicProfile
): Meal {
  const userDiet = profile.diet_type || profile.diet || 'balanced';
  const userAllergies = profile.allergies || [];

  const safeFoods = getSafeFoods(userDiet, userAllergies);
  const matchingTypeFoods = safeFoods.filter(
    (f) => f.mealType === meal.type && f.name !== meal.title
  );

  const pool = matchingTypeFoods.length > 0 ? matchingTypeFoods : safeFoods.filter((f) => f.name !== meal.title);

  if (pool.length === 0) {
    // If no other safe food exists, keep current with fresh timestamp
    return { ...meal, isEaten: false };
  }

  // Pick a random alternative from safe pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedFood = pool[randomIndex];

  return foodItemToMeal(selectedFood, day, Date.now() % 1000);
}

/**
 * Aggregates all ingredients across the 7-day meal plan into a combined,
 * categorized grocery list, preserving existing checked statuses.
 */
export function aggregateGroceryList(
  mealPlans: DayMealPlan[],
  existingGroceryList: GroceryItem[] = []
): GroceryItem[] {
  const existingCheckedMap = new Map<string, boolean>();
  for (const item of existingGroceryList) {
    existingCheckedMap.set(item.name.toLowerCase().trim(), item.checked);
  }

  // Category classifier
  const categorizeIngredient = (ing: string): GroceryItem['category'] => {
    const lower = ing.toLowerCase();
    if (
      lower.includes('spinach') ||
      lower.includes('palak') ||
      lower.includes('methi') ||
      lower.includes('cucumber') ||
      lower.includes('tomato') ||
      lower.includes('lemon') ||
      lower.includes('okra') ||
      lower.includes('bhindi') ||
      lower.includes('lauki') ||
      lower.includes('eggplant') ||
      lower.includes('baingan') ||
      lower.includes('ginger') ||
      lower.includes('garlic') ||
      lower.includes('coriander') ||
      lower.includes('carrot') ||
      lower.includes('drumstick') ||
      lower.includes('beans') ||
      lower.includes('amla') ||
      lower.includes('greens')
    ) {
      return 'Produce';
    }

    if (
      lower.includes('moong') ||
      lower.includes('dal') ||
      lower.includes('lentil') ||
      lower.includes('chana') ||
      lower.includes('rajma') ||
      lower.includes('chickpea') ||
      lower.includes('paneer') ||
      lower.includes('tofu') ||
      lower.includes('egg') ||
      lower.includes('fish') ||
      lower.includes('chicken') ||
      lower.includes('curd')
    ) {
      return 'Proteins';
    }

    if (
      lower.includes('makhana') ||
      lower.includes('flaxseed') ||
      lower.includes('almond') ||
      lower.includes('walnut') ||
      lower.includes('peanut') ||
      lower.includes('sesame') ||
      lower.includes('seeds')
    ) {
      return 'Seeds & Nuts';
    }

    return 'Pantry';
  };

  const ingredientMap = new Map<string, { count: number; category: GroceryItem['category'] }>();

  for (const day of mealPlans) {
    for (const meal of day.meals) {
      for (const ingredient of meal.keyIngredients) {
        const cleaned = ingredient.trim();
        if (!cleaned) continue;

        const key = cleaned.toLowerCase();
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          ingredientMap.set(key, {
            count: 1,
            category: categorizeIngredient(cleaned),
          });
        }
      }
    }
  }

  const result: GroceryItem[] = [];
  let index = 1;

  for (const [name, info] of ingredientMap.entries()) {
    // Format quantity according to frequency
    const quantity = info.count >= 4 ? 'Large bunch / 500g' : info.count >= 2 ? 'Medium pack / 250g' : '1 unit / 100g';
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    const checked = existingCheckedMap.get(name) || false;

    result.push({
      id: `grocery_${index++}`,
      name: capitalized,
      category: info.category,
      checked,
      quantity,
    });
  }

  // Sort by category: Produce, Proteins, Pantry, Seeds & Nuts
  const order: Record<GroceryItem['category'], number> = {
    Produce: 1,
    Proteins: 2,
    Pantry: 3,
    'Seeds & Nuts': 4,
  };

  return result.sort((a, b) => order[a.category] - order[b.category] || a.name.localeCompare(b.name));
}

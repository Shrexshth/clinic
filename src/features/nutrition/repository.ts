// ============================================================================
// src/features/nutrition/repository.ts
//
// SQLite-backed Nutrition Repository with Indian foods.json integration,
// dynamic 7-day meal plan generation, strict allergen filtering, meal swap,
// and combined grocery list aggregation.
// ============================================================================

import {
  DayMealPlan,
  FoodItemRecommendation,
  GroceryItem,
  Meal,
} from '../../data/mock';
import { getDatabase } from '../../db/database';
import foodsData from '../../data/foods.json';
import {
  FoodItem,
  getNutrientRulesForBiomarkers,
  getSafeFoods,
  isFoodSafeForUser,
} from '../../data/markerNutrientMap';
import {
  aggregateGroceryList,
  generate7DayMealPlan,
  swapMealWithSafeAlternative,
  UserDemographicProfile,
} from './mealPlannerEngine';

export interface INutritionRepository {
  getFoodRecommendations(): Promise<FoodItemRecommendation[]>;
  getMealPlans(): Promise<DayMealPlan[]>;
  getMealPlanForDay(day: string): Promise<DayMealPlan | undefined>;
  toggleMealEaten(day: string, mealId: string): Promise<boolean>;
  swapMeal(day: string, mealId: string): Promise<Meal | undefined>;
  getGroceryList(): Promise<GroceryItem[]>;
  toggleGroceryItem(itemId: string): Promise<boolean>;
  regenerateMealPlan(): Promise<DayMealPlan[]>;
}

interface UserProfileRow {
  diet_type: string;
  allergies: string;
  age: number;
  sex: string;
}

interface BiomarkerResultRow {
  biomarker_key: string;
  status: string;
  value: number;
}

interface MealPlanRow {
  day: string;
  date_label: string;
}

interface MealItemRow {
  id: string;
  day: string;
  type: string;
  title: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  is_eaten: number;
  description: string;
  target_nutrients: string;
  key_ingredients: string;
}

export class SQLiteNutritionRepository implements INutritionRepository {
  private inMemoryCheckedGroceryIds = new Set<string>();

  /**
   * Loads current user profile demographics from SQLite.
   */
  private async getUserProfile(): Promise<UserDemographicProfile> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<UserProfileRow>(
      'SELECT diet_type, allergies, age, sex FROM user_profile LIMIT 1'
    );

    if (!row) {
      return { diet: 'veg', allergies: [], age: 30, sex: 'male' };
    }

    let allergies: string[] = [];
    try {
      allergies = JSON.parse(row.allergies);
    } catch {
      allergies = [];
    }

    return {
      diet: row.diet_type,
      diet_type: row.diet_type,
      allergies,
      age: row.age,
      sex: row.sex,
    };
  }

  /**
   * Loads flagged biomarkers from SQLite.
   */
  private async getFlaggedBiomarkers(): Promise<Array<{ biomarkerKey: string; status: string; value: number }>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<BiomarkerResultRow>(
      "SELECT biomarker_key, status, value FROM biomarker_results WHERE status != 'normal'"
    );

    return rows.map((r) => ({
      biomarkerKey: r.biomarker_key,
      status: r.status,
      value: r.value,
    }));
  }

  /**
   * Generates dynamic "Eat More" and "Limit" food recommendations
   * tailored to current flagged biomarkers and filtered by diet and allergies.
   */
  async getFoodRecommendations(): Promise<FoodItemRecommendation[]> {
    const profile = await this.getUserProfile();
    const flagged = await this.getFlaggedBiomarkers();
    const rules = getNutrientRulesForBiomarkers(flagged);

    const safeFoods = getSafeFoods(profile.diet, profile.allergies);

    const recommendations: FoodItemRecommendation[] = [];

    // 1. Eat More: foods matching prioritized nutrient targets
    const eatMoreFoodIds = new Set<string>();
    for (const rule of rules) {
      for (const id of rule.prioritizedFoodIds) {
        eatMoreFoodIds.add(id);
      }
    }

    // Filter safe foods matching these IDs
    const matchedEatMore = safeFoods.filter((f) => eatMoreFoodIds.has(f.id));
    const pool = matchedEatMore.length >= 3 ? matchedEatMore : safeFoods;

    for (const food of pool.slice(0, 6)) {
      recommendations.push({
        id: `rec_${food.id}`,
        food: food.name,
        category: food.category,
        type: 'eat_more',
        reason: food.healthBenefits,
        servingAdvice: food.serving,
      });
    }

    // 2. Limit: Categories and foods to moderate based on flagged rules
    const avoidSet = new Set<string>();
    for (const rule of rules) {
      for (const item of rule.avoidCategories) {
        avoidSet.add(item);
      }
    }

    if (avoidSet.size === 0) {
      avoidSet.add('Deep-fried snacks & commercial sweets');
      avoidSet.add('Refined flour (Maida) bakery products');
      avoidSet.add('Excessive tea/coffee with iron-rich meals');
    }

    let limitIndex = 1;
    for (const avoidItem of avoidSet) {
      recommendations.push({
        id: `limit_${limitIndex++}`,
        food: avoidItem,
        category: 'Lifestyle & Dietary Limit',
        type: 'limit',
        reason: 'May impede micronutrient bioavailability or elevate circulating metabolic lipids.',
        servingAdvice: 'Strictly minimize or eliminate',
      });
      if (recommendations.filter((r) => r.type === 'limit').length >= 4) break;
    }

    return recommendations;
  }

  /**
   * Persists a 7-day meal plan to SQLite.
   */
  private async saveMealPlansToSQLite(plans: DayMealPlan[]): Promise<void> {
    const db = await getDatabase();

    await db.runAsync('DELETE FROM meal_items');
    await db.runAsync('DELETE FROM meal_plans');

    for (const plan of plans) {
      await db.runAsync(
        'INSERT OR REPLACE INTO meal_plans (day, date_label) VALUES (?, ?)',
        [plan.day, plan.dateLabel]
      );

      for (const meal of plan.meals) {
        await db.runAsync(
          `INSERT OR REPLACE INTO meal_items (
            id, day, type, title, calories, protein, carbs, fats, is_eaten, description, target_nutrients, key_ingredients
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            meal.id,
            plan.day,
            meal.type,
            meal.title,
            meal.calories,
            meal.protein,
            meal.carbs,
            meal.fats,
            meal.isEaten ? 1 : 0,
            meal.description,
            JSON.stringify(meal.targetNutrients),
            JSON.stringify(meal.keyIngredients),
          ]
        );
      }
    }
  }

  /**
   * Regenerates a fresh 7-day meal plan using the mealPlannerEngine.
   */
  async regenerateMealPlan(): Promise<DayMealPlan[]> {
    const profile = await this.getUserProfile();
    const flagged = await this.getFlaggedBiomarkers();

    const newPlans = generate7DayMealPlan(flagged, profile);
    await this.saveMealPlansToSQLite(newPlans);
    return newPlans;
  }

  /**
   * Retrieves the 7-day meal plan.
   * If empty or contains newly declared allergens, regenerates compliant meals.
   */
  async getMealPlans(): Promise<DayMealPlan[]> {
    const db = await getDatabase();
    const profile = await this.getUserProfile();
    const planRows = await db.getAllAsync<MealPlanRow>('SELECT * FROM meal_plans');

    if (planRows.length === 0) {
      return this.regenerateMealPlan();
    }

    const itemRows = await db.getAllAsync<MealItemRow>('SELECT * FROM meal_items');
    const result: DayMealPlan[] = [];

    let hasAllergenViolation = false;

    for (const plan of planRows) {
      const dayItems = itemRows.filter((it) => it.day === plan.day);
      const meals: Meal[] = [];

      for (const row of dayItems) {
        let targetNutrients: string[] = [];
        let keyIngredients: string[] = [];
        try {
          targetNutrients = JSON.parse(row.target_nutrients);
        } catch {}
        try {
          keyIngredients = JSON.parse(row.key_ingredients);
        } catch {}

        // STRICT SAFETY CHECK: Validate every item against current allergies and diet
        const rawFood = (foodsData.foods as FoodItem[]).find((f) => f.name === row.title);
        if (rawFood && !isFoodSafeForUser(rawFood, profile.diet, profile.allergies)) {
          hasAllergenViolation = true;
        }

        meals.push({
          id: row.id,
          type: row.type as any,
          title: row.title,
          calories: row.calories,
          protein: row.protein,
          carbs: row.carbs,
          fats: row.fats,
          isEaten: row.is_eaten === 1,
          description: row.description,
          targetNutrients,
          keyIngredients,
        });
      }

      result.push({
        day: plan.day,
        dateLabel: plan.date_label,
        meals,
      });
    }

    // If any allergen slipped in (e.g. user updated profile with new allergies),
    // immediately regenerate compliant meal plan!
    if (hasAllergenViolation) {
      return this.regenerateMealPlan();
    }

    return result;
  }

  async getMealPlanForDay(day: string): Promise<DayMealPlan | undefined> {
    const plans = await this.getMealPlans();
    return plans.find((p) => p.day === day);
  }

  async toggleMealEaten(day: string, mealId: string): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MealItemRow>(
      'SELECT is_eaten FROM meal_items WHERE id = ?',
      [mealId]
    );

    if (row) {
      const nextVal = row.is_eaten === 1 ? 0 : 1;
      await db.runAsync('UPDATE meal_items SET is_eaten = ? WHERE id = ?', [nextVal, mealId]);
      return nextVal === 1;
    }
    return false;
  }

  /**
   * Swaps an individual meal with an allergen-safe, diet-safe alternative from foods.json.
   */
  async swapMeal(day: string, mealId: string): Promise<Meal | undefined> {
    const db = await getDatabase();
    const profile = await this.getUserProfile();

    const row = await db.getFirstAsync<MealItemRow>(
      'SELECT * FROM meal_items WHERE id = ?',
      [mealId]
    );

    if (!row) return undefined;

    let targetNutrients: string[] = [];
    let keyIngredients: string[] = [];
    try {
      targetNutrients = JSON.parse(row.target_nutrients);
    } catch {}
    try {
      keyIngredients = JSON.parse(row.key_ingredients);
    } catch {}

    const currentMeal: Meal = {
      id: row.id,
      type: row.type as any,
      title: row.title,
      calories: row.calories,
      protein: row.protein,
      carbs: row.carbs,
      fats: row.fats,
      isEaten: row.is_eaten === 1,
      description: row.description,
      targetNutrients,
      keyIngredients,
    };

    // Swap with safe alternative from foods.json
    const swapped = swapMealWithSafeAlternative(currentMeal, day, profile);

    await db.runAsync(
      `UPDATE meal_items SET
        title = ?,
        calories = ?,
        protein = ?,
        carbs = ?,
        fats = ?,
        is_eaten = 0,
        description = ?,
        target_nutrients = ?,
        key_ingredients = ?
       WHERE id = ?`,
      [
        swapped.title,
        swapped.calories,
        swapped.protein,
        swapped.carbs,
        swapped.fats,
        swapped.description,
        JSON.stringify(swapped.targetNutrients),
        JSON.stringify(swapped.keyIngredients),
        mealId,
      ]
    );

    return {
      ...swapped,
      id: mealId,
    };
  }

  /**
   * Aggregates ingredients across all 7 days of meals into a combined grocery list.
   */
  async getGroceryList(): Promise<GroceryItem[]> {
    const plans = await this.getMealPlans();
    const dummyExisting: GroceryItem[] = Array.from(this.inMemoryCheckedGroceryIds).map((name) => ({
      id: name,
      name,
      category: 'Pantry',
      checked: true,
      quantity: '',
    }));

    const aggregated = aggregateGroceryList(plans, dummyExisting);
    return aggregated;
  }

  async toggleGroceryItem(itemId: string): Promise<boolean> {
    const list = await this.getGroceryList();
    const item = list.find((g) => g.id === itemId);
    if (!item) return false;

    const lowerName = item.name.toLowerCase().trim();
    if (this.inMemoryCheckedGroceryIds.has(lowerName)) {
      this.inMemoryCheckedGroceryIds.delete(lowerName);
      return false;
    } else {
      this.inMemoryCheckedGroceryIds.add(lowerName);
      return true;
    }
  }
}

export const nutritionRepository: INutritionRepository = new SQLiteNutritionRepository();

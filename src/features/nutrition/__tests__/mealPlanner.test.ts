import foodsData from '@/data/foods.json';
import {
  FoodItem,
  getNutrientRulesForBiomarkers,
  getSafeFoods,
  isFoodSafeForUser,
  MARKER_NUTRIENT_RULES,
} from '@/data/markerNutrientMap';
import {
  aggregateGroceryList,
  generate7DayMealPlan,
  swapMealWithSafeAlternative,
} from '../mealPlannerEngine';

describe('Foods Database (src/data/foods.json)', () => {
  const foods = foodsData.foods as FoodItem[];

  it('contains at least 20 staple Indian foods', () => {
    expect(foods.length).toBeGreaterThanOrEqual(20);
  });

  it('every food has nutritional values per 100g, tags, allergens, and ingredients', () => {
    foods.forEach((food) => {
      expect(food.id).toBeTruthy();
      expect(food.name).toBeTruthy();
      expect(typeof food.veg).toBe('boolean');
      expect(typeof food.vegan).toBe('boolean');
      expect(Array.isArray(food.allergens)).toBe(true);
      expect(Array.isArray(food.keyIngredients)).toBe(true);
      expect(food.keyIngredients.length).toBeGreaterThan(0);
      expect(food.nutrientsPer100g.calories).toBeGreaterThan(0);
      expect(food.nutrientsPer100g.protein).toBeGreaterThanOrEqual(0);
      expect(food.nutrientsPer100g.carbs).toBeGreaterThanOrEqual(0);
      expect(food.nutrientsPer100g.fats).toBeGreaterThanOrEqual(0);
    });
  });

  it('strictly classifies vegan foods as also vegetarian', () => {
    foods.forEach((food) => {
      if (food.vegan) {
        expect(food.veg).toBe(true);
      }
    });
  });
});

describe('Marker to Nutrient Mapping (src/data/markerNutrientMap.ts)', () => {
  it('maps low hemoglobin to iron and vitamin C cofactors', () => {
    const rules = getNutrientRulesForBiomarkers([
      { biomarkerKey: 'hemoglobin', status: 'low', value: 10.2 },
    ]);
    expect(rules.length).toBeGreaterThan(0);
    const ironRule = rules.find((r) => r.markerKey === 'hemoglobin');
    expect(ironRule).toBeDefined();
    expect(ironRule?.priorityNutrients).toContain('iron');
    expect(ironRule?.priorityNutrients).toContain('vitaminC');
  });

  it('maps high LDL to soluble fiber and limiting saturated fats', () => {
    const rules = getNutrientRulesForBiomarkers([
      { biomarkerKey: 'ldl_cholesterol', status: 'high', value: 165 },
    ]);
    const ldlRule = rules.find((r) => r.markerKey === 'ldl_cholesterol');
    expect(ldlRule).toBeDefined();
    expect(ldlRule?.priorityNutrients).toContain('fiber');
    expect(ldlRule?.limitNutrients.some((n) => n.includes('saturated'))).toBe(true);
  });

  it('maps high fasting glucose to complex fiber and limiting simple sugars', () => {
    const rules = getNutrientRulesForBiomarkers([
      { biomarkerKey: 'fasting_glucose', status: 'high', value: 130 },
    ]);
    const glucoseRule = rules.find((r) => r.markerKey === 'fasting_glucose');
    expect(glucoseRule).toBeDefined();
    expect(glucoseRule?.priorityNutrients).toContain('fiber');
    expect(glucoseRule?.limitNutrients.some((n) => n.includes('sugar') || n.includes('carb'))).toBe(true);
  });
});

describe('Diet Type and Allergen Filtering Safety Rules', () => {
  const foods = foodsData.foods as FoodItem[];

  it('rejects non-veg foods when diet is vegetarian', () => {
    const nonVegFoods = foods.filter((f) => !f.veg);
    expect(nonVegFoods.length).toBeGreaterThan(0);

    nonVegFoods.forEach((food) => {
      const isSafe = isFoodSafeForUser(food, 'veg', []);
      expect(isSafe).toBe(false);
    });
  });

  it('rejects dairy and non-veg when diet is vegan', () => {
    const paneerFood = foods.find((f) => f.id === 'palak_paneer_ragi_roti');
    expect(paneerFood).toBeDefined();
    if (paneerFood) {
      expect(isFoodSafeForUser(paneerFood, 'vegan', [])).toBe(false);
    }

    const chaasFood = foods.find((f) => f.id === 'chaas_mint_jeera');
    expect(chaasFood).toBeDefined();
    if (chaasFood) {
      expect(isFoodSafeForUser(chaasFood, 'vegan', [])).toBe(false);
    }
  });

  it('CRITICAL: NEVER permits food containing declared allergen (Dairy)', () => {
    const safeList = getSafeFoods('veg', ['dairy']);
    safeList.forEach((food) => {
      expect(food.allergens).not.toContain('dairy');
      const lowerName = food.name.toLowerCase();
      const lowerIngredients = food.keyIngredients.map((i) => i.toLowerCase());
      expect(lowerName).not.toContain('paneer');
      expect(lowerName).not.toContain('curd');
      expect(lowerIngredients.some((i) => i.includes('paneer'))).toBe(false);
      expect(lowerIngredients.some((i) => i.includes('curd'))).toBe(false);
      expect(lowerIngredients.some((i) => i.includes('ghee'))).toBe(false);
    });
  });

  it('CRITICAL: NEVER permits food containing declared allergen (Gluten)', () => {
    const safeList = getSafeFoods('veg', ['gluten']);
    safeList.forEach((food) => {
      expect(food.allergens).not.toContain('gluten');
      const lowerName = food.name.toLowerCase();
      expect(lowerName).not.toContain('thepla');
      expect(lowerName).not.toContain('multigrain');
      const lowerIngredients = food.keyIngredients.map((i) => i.toLowerCase());
      expect(
        lowerIngredients.some((i) => i.includes('wheat') || i.includes('maida') || i.includes('suji') || i.includes('gluten'))
      ).toBe(false);
    });
  });

  it('CRITICAL: NEVER permits food containing declared allergen (Nuts / Peanuts)', () => {
    const safeList = getSafeFoods('veg', ['nuts', 'peanuts']);
    safeList.forEach((food) => {
      expect(food.allergens).not.toContain('nuts');
      expect(food.allergens).not.toContain('peanuts');
      const lowerIngredients = food.keyIngredients.map((i) => i.toLowerCase());
      expect(lowerIngredients.some((i) => i.includes('almond'))).toBe(false);
      expect(lowerIngredients.some((i) => i.includes('walnut'))).toBe(false);
      expect(lowerIngredients.some((i) => i.includes('peanut'))).toBe(false);
    });
  });
});

describe('7-Day Meal Planner Engine (src/features/nutrition/mealPlannerEngine.ts)', () => {
  const mockBiomarkers = [
    { biomarkerKey: 'hemoglobin', status: 'low', value: 10.5 },
    { biomarkerKey: 'ldl_cholesterol', status: 'high', value: 160 },
  ];

  it('generates a full 7-day meal plan with Mon through Sun', () => {
    const plan = generate7DayMealPlan(mockBiomarkers, { diet: 'veg', allergies: [] });
    expect(plan.length).toBe(7);
    const expectedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    plan.forEach((dayPlan, i) => {
      expect(dayPlan.day).toBe(expectedDays[i]);
      expect(dayPlan.meals.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('uses ONLY foods from foods.json', () => {
    const allKnownNames = new Set((foodsData.foods as FoodItem[]).map((f) => f.name));
    const plan = generate7DayMealPlan(mockBiomarkers, { diet: 'veg', allergies: [] });

    plan.forEach((dayPlan) => {
      dayPlan.meals.forEach((meal) => {
        expect(allKnownNames.has(meal.title)).toBe(true);
      });
    });
  });

  it('GUARANTEE: 7-day meal plan contains ZERO declared allergens', () => {
    const declaredAllergies = ['dairy', 'gluten'];
    const plan = generate7DayMealPlan(mockBiomarkers, {
      diet: 'veg',
      allergies: declaredAllergies,
    });

    const foods = foodsData.foods as FoodItem[];

    plan.forEach((dayPlan) => {
      dayPlan.meals.forEach((meal) => {
        const food = foods.find((f) => f.name === meal.title);
        expect(food).toBeDefined();
        if (food) {
          expect(isFoodSafeForUser(food, 'veg', declaredAllergies)).toBe(true);
          expect(food.allergens).not.toContain('dairy');
          expect(food.allergens).not.toContain('gluten');
        }
      });
    });
  });

  it('swaps a meal with a safe alternative from foods.json', () => {
    const plan = generate7DayMealPlan(mockBiomarkers, { diet: 'veg', allergies: ['dairy'] });
    const originalMeal = plan[0].meals[0];

    const swapped = swapMealWithSafeAlternative(originalMeal, 'Mon', {
      diet: 'veg',
      allergies: ['dairy'],
    });

    expect(swapped).toBeDefined();
    expect(swapped.title).toBeDefined();
    // Swapped meal must still be allergen-safe
    const foods = foodsData.foods as FoodItem[];
    const food = foods.find((f) => f.name === swapped.title);
    if (food) {
      expect(isFoodSafeForUser(food, 'veg', ['dairy'])).toBe(true);
      expect(food.allergens).not.toContain('dairy');
    }
  });

  it('aggregates ingredients across all 7 days into a categorized grocery list', () => {
    const plan = generate7DayMealPlan(mockBiomarkers, { diet: 'veg', allergies: [] });
    const grocery = aggregateGroceryList(plan);

    expect(grocery.length).toBeGreaterThan(0);
    grocery.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(['Produce', 'Proteins', 'Pantry', 'Seeds & Nuts']).toContain(item.category);
      expect(item.checked).toBe(false);
    });

    // Test preserving checked state
    const firstItem = grocery[0];
    firstItem.checked = true;
    const reaggregated = aggregateGroceryList(plan, [firstItem]);
    const found = reaggregated.find((i) => i.name.toLowerCase() === firstItem.name.toLowerCase());
    expect(found?.checked).toBe(true);
  });
});

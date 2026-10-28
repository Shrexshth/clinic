import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Salad,
  CheckCircle2,
  Circle,
  RefreshCw,
  ShoppingBag,
  Flame,
  Check,
  AlertOctagon,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';

import { Colors, Radii, Shadows, Spacing, Typography } from '@/theme';
import { AppCard } from '@/components/AppCard';
import { PillChip } from '@/components/PillChip';
import { SectionHeader } from '@/components/SectionHeader';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { SkeletonMealCard } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
} from '@/utils/haptics';
import {
  DayMealPlan,
  FoodItemRecommendation,
  GroceryItem,
  Meal,
} from '@/data/mock';
import { useAppStore } from '@/store/useAppStore';
import { nutritionRepository } from './repository';

export function MealsView() {
  const { userProfile } = useAppStore();
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'foods' | 'grocery'>('planner');
  const [selectedDay, setSelectedDay] = useState<string>('Mon');
  const [mealPlans, setMealPlans] = useState<DayMealPlan[]>([]);
  const [activeDayPlan, setActiveDayPlan] = useState<DayMealPlan | null>(null);
  const [foodRecommendations, setFoodRecommendations] = useState<FoodItemRecommendation[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadNutritionData() {
      setIsLoading(true);
      try {
        const plans = await nutritionRepository.getMealPlans();
        setMealPlans(plans);
        const monPlan = plans.find((p) => p.day === selectedDay) || plans[0];
        setActiveDayPlan(monPlan);

        const foods = await nutritionRepository.getFoodRecommendations();
        setFoodRecommendations(foods);

        const grocery = await nutritionRepository.getGroceryList();
        setGroceryList(grocery);
      } finally {
        setIsLoading(false);
      }
    }
    loadNutritionData();
  }, [userProfile?.dietType, userProfile?.allergies?.join(',')]);

  const handleSelectDay = (day: string) => {
    triggerLightHaptic();
    setSelectedDay(day);
    const plan = mealPlans.find((p) => p.day === day);
    if (plan) setActiveDayPlan(plan);
  };

  const handleToggleMealEaten = async (mealId: string) => {
    triggerSuccessHaptic();
    await nutritionRepository.toggleMealEaten(selectedDay, mealId);
    const updated = await nutritionRepository.getMealPlanForDay(selectedDay);
    if (updated) {
      setActiveDayPlan({ ...updated });
      const allPlans = await nutritionRepository.getMealPlans();
      setMealPlans(allPlans);
    }
  };

  const handleSwapMeal = async (mealId: string) => {
    triggerMediumHaptic();
    await nutritionRepository.swapMeal(selectedDay, mealId);
    const updated = await nutritionRepository.getMealPlanForDay(selectedDay);
    if (updated) {
      setActiveDayPlan({ ...updated });
      const allPlans = await nutritionRepository.getMealPlans();
      setMealPlans(allPlans);
      const updatedGrocery = await nutritionRepository.getGroceryList();
      setGroceryList(updatedGrocery);
    }
  };

  const handleToggleGrocery = async (itemId: string) => {
    triggerLightHaptic();
    await nutritionRepository.toggleGroceryItem(itemId);
    const updated = await nutritionRepository.getGroceryList();
    setGroceryList([...updated]);
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const eatMoreList = foodRecommendations.filter((f) => f.type === 'eat_more');
  const limitList = foodRecommendations.filter((f) => f.type === 'limit');

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>BIOMARKER NUTRITION</Text>
          <Text style={styles.headerTitle}>
            Meals & <Text style={{ color: Colors.primary }}>Diet</Text>
          </Text>
        </View>
      </View>

      {/* Sub-tab Navigation Switcher */}
      <View style={styles.subTabRow}>
        <Pressable
          onPress={() => setActiveSubTab('planner')}
          style={[styles.subTabItem, activeSubTab === 'planner' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, activeSubTab === 'planner' && styles.subTabTextActive]}>
            Meal Planner
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('foods')}
          style={[styles.subTabItem, activeSubTab === 'foods' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, activeSubTab === 'foods' && styles.subTabTextActive]}>
            Eat & Limit
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSubTab('grocery')}
          style={[styles.subTabItem, activeSubTab === 'grocery' && styles.subTabActive]}
        >
          <Text style={[styles.subTabText, activeSubTab === 'grocery' && styles.subTabTextActive]}>
            Grocery List
          </Text>
        </Pressable>
      </View>

      {/* Diet & Allergen Safety Card */}
      <View style={styles.safetyCard}>
        <View style={styles.safetyIconBadge}>
          <ShieldCheck size={20} color={Colors.statusNormal} strokeWidth={2.4} />
        </View>
        <View style={styles.safetyTextCol}>
          <View style={styles.safetyTitleRow}>
            <Text style={styles.safetyTitle}>Allergen-Safe Indian Plan</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>100% SAFE</Text>
            </View>
          </View>
          <Text style={styles.safetySubtitle}>
            Diet: <Text style={styles.safetyBold}>{userProfile?.dietType ? userProfile.dietType.toUpperCase() : 'VEG'}</Text>
            {userProfile?.allergies && userProfile.allergies.length > 0
              ? ` • Excluded: ${userProfile.allergies.join(', ')}`
              : ' • No allergens declared'}
          </Text>
        </View>
      </View>

      {/* 1. MEAL PLANNER TAB */}
      {activeSubTab === 'planner' && (
        <View>
          {/* Horizontal Day Selector */}
          <View style={styles.daySelectorWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daySelectorRow}
            >
              {days.map((d) => {
                const isSelected = selectedDay === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => handleSelectDay(d)}
                    android_ripple={{ color: Colors.ripple, borderless: false }}
                    style={[
                      styles.dayButton,
                      isSelected ? styles.dayButtonSelected : styles.dayButtonUnselected,
                    ]}
                  >
                    <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Meals List for Selected Day */}
          <SectionHeader
            text={`${selectedDay}’s Planned`}
            highlightWord="Nutrition"
            subtitle="Recipes optimized for your low Ferritin and elevated Glucose"
          />

          {isLoading ? (
            <View>
              <SkeletonMealCard />
              <SkeletonMealCard />
              <SkeletonMealCard />
            </View>
          ) : !activeDayPlan || activeDayPlan.meals.length === 0 ? (
            <EmptyState
              title={`No Meals for ${selectedDay}`}
              description="No recipes currently scheduled for this day. Switch to another day or refresh the meal plan."
              actionLabel="Return to Monday"
              onAction={() => handleSelectDay('Mon')}
            />
          ) : (
            activeDayPlan.meals.map((meal) => (
              <AppCard key={meal.id} padding="lg" style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealTypeBadge}>
                    <Text maxFontSizeMultiplier={1.4} style={styles.mealTypeText}>
                      {meal.type.toUpperCase()}
                    </Text>
                  </View>

                  {/* Mark as Eaten Button */}
                  <Pressable
                    onPress={() => handleToggleMealEaten(meal.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Mark ${meal.title} as ${meal.isEaten ? 'not eaten' : 'eaten'}`}
                    accessibilityState={{ checked: meal.isEaten }}
                    style={[styles.eatenButton, meal.isEaten && styles.eatenButtonActive]}
                  >
                    {meal.isEaten ? (
                      <CheckCircle2 size={16} color={Colors.statusNormal} strokeWidth={2.4} />
                    ) : (
                      <Circle size={16} color={Colors.secondaryText} strokeWidth={2} />
                    )}
                    <Text
                      maxFontSizeMultiplier={1.4}
                      style={[styles.eatenButtonText, meal.isEaten && styles.eatenButtonTextActive]}
                    >
                      {meal.isEaten ? 'Eaten' : 'Mark Eaten'}
                    </Text>
                  </Pressable>
                </View>

                <Text maxFontSizeMultiplier={1.4} style={styles.mealTitle}>
                  {meal.title}
                </Text>
                <Text maxFontSizeMultiplier={1.4} style={styles.mealDescription}>
                  {meal.description}
                </Text>

                {/* Nutrition Macros */}
                <View style={styles.macroRow}>
                  <View style={styles.macroItem}>
                    <Flame size={12} color={Colors.primary} />
                    <Text maxFontSizeMultiplier={1.4} style={styles.macroText}>
                      {meal.calories} kcal
                    </Text>
                  </View>
                  <Text style={styles.macroDivider}>•</Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.macroText}>
                    Protein: {meal.protein}
                  </Text>
                  <Text style={styles.macroDivider}>•</Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.macroText}>
                    Carbs: {meal.carbs}
                  </Text>
                  <Text style={styles.macroDivider}>•</Text>
                  <Text maxFontSizeMultiplier={1.4} style={styles.macroText}>
                    Fats: {meal.fats}
                  </Text>
                </View>

                {/* Action: Swap Meal */}
                <View style={styles.mealFooterRow}>
                  <View style={styles.nutrientTags}>
                    {meal.targetNutrients.map((n, i) => (
                      <View key={i} style={styles.nutrientTag}>
                        <Text maxFontSizeMultiplier={1.4} style={styles.nutrientTagText}>
                          {n}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    onPress={() => handleSwapMeal(meal.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Swap ${meal.title} recipe`}
                    android_ripple={{ color: Colors.ripple, borderless: false }}
                    style={styles.swapButton}
                  >
                    <RefreshCw size={13} color={Colors.deepMaroon} />
                    <Text maxFontSizeMultiplier={1.4} style={styles.swapButtonText}>
                      Swap
                    </Text>
                  </Pressable>
                </View>
              </AppCard>
            ))
          )}
        </View>
      )}

      {/* 2. FOOD RECOMMENDATIONS TAB: Eat More & Limit */}
      {activeSubTab === 'foods' && (
        <View>
          {/* Eat More List */}
          <SectionHeader
            text="Priority"
            highlightWord="Eat More"
            subtitle="Whole foods that supply required micronutrient cofactors"
          />

          {eatMoreList.map((item) => (
            <AppCard key={item.id} padding="lg" style={styles.foodCard}>
              <View style={styles.foodCardHeader}>
                <View style={styles.foodCheckCircle}>
                  <Check size={16} color={Colors.statusNormal} strokeWidth={3} />
                </View>
                <View style={styles.foodNameCol}>
                  <Text style={styles.foodName}>{item.food}</Text>
                  <Text style={styles.foodCat}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.foodReasonText}>{item.reason}</Text>
              <Text style={styles.foodServingText}>Serving: {item.servingAdvice}</Text>
            </AppCard>
          ))}

          {/* Limit List */}
          <SectionHeader
            text="Habits to"
            highlightWord="Limit"
            subtitle="Foods and routines that block absorption or spike glucose"
            style={{ marginTop: Spacing.xl }}
          />

          {limitList.map((item) => (
            <AppCard key={item.id} padding="lg" style={[styles.foodCard, styles.limitCard]}>
              <View style={styles.foodCardHeader}>
                <View style={styles.foodLimitCircle}>
                  <AlertOctagon size={16} color={Colors.statusAbnormal} strokeWidth={2.4} />
                </View>
                <View style={styles.foodNameCol}>
                  <Text style={styles.foodName}>{item.food}</Text>
                  <Text style={styles.foodCat}>{item.category}</Text>
                </View>
              </View>
              <Text style={styles.foodReasonText}>{item.reason}</Text>
              <Text style={styles.foodServingText}>Guideline: {item.servingAdvice}</Text>
            </AppCard>
          ))}
        </View>
      )}

      {/* 3. GROCERY LIST TAB */}
      {activeSubTab === 'grocery' && (
        <View>
          <SectionHeader
            text="Weekly"
            highlightWord="Grocery List"
            subtitle="Ingredients mapped directly from your 7-day meal plan"
          />

          <View style={styles.groceryProgressRow}>
            <Text style={styles.groceryProgressText}>
              {groceryList.filter((g) => g.checked).length} of {groceryList.length} items collected
            </Text>
          </View>

          <AppCard padding="lg">
            {groceryList.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleToggleGrocery(item.id)}
                android_ripple={{ color: Colors.ripple, borderless: false }}
                style={styles.groceryRow}
              >
                <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
                  {item.checked && <Check size={12} color={Colors.white} strokeWidth={3} />}
                </View>

                <View style={styles.groceryDetails}>
                  <Text style={[styles.groceryName, item.checked && styles.groceryNameChecked]}>
                    {item.name}
                  </Text>
                  <Text style={styles.groceryCategory}>{item.category} • {item.quantity}</Text>
                </View>
              </Pressable>
            ))}
          </AppCard>
        </View>
      )}

      {/* Medical Disclaimer Banner */}
      <View style={styles.disclaimerWrapper}>
        <MedicalDisclaimer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.huge * 2.2,
  },
  topHeader: {
    marginBottom: Spacing.md,
  },
  headerSubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    letterSpacing: 1,
    fontWeight: '700',
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Typography.hero.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.pills,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radii.pills,
  },
  subTabActive: {
    backgroundColor: Colors.white,
    ...Shadows.soft,
  },
  subTabText: {
    color: Colors.secondaryText,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: Colors.deepMaroon,
    fontWeight: '700',
  },
  daySelectorWrapper: {
    marginBottom: Spacing.lg,
  },
  daySelectorRow: {
    paddingVertical: 2,
    gap: Spacing.sm,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.pills,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayButtonSelected: {
    backgroundColor: Colors.deepMaroon,
    borderColor: Colors.deepMaroon,
    ...Shadows.soft,
  },
  dayButtonUnselected: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  dayButtonText: {
    color: Colors.text,
    fontFamily: Typography.smallBold.fontFamily,
    fontSize: Typography.smallBold.fontSize,
    fontWeight: '700',
  },
  dayButtonTextSelected: {
    color: Colors.white,
  },
  mealCard: {
    marginBottom: Spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  mealTypeBadge: {
    backgroundColor: Colors.redTint,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
  },
  mealTypeText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  eatenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pills,
    backgroundColor: Colors.borderLight,
  },
  eatenButtonActive: {
    backgroundColor: Colors.statusNormalBg,
  },
  eatenButtonText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
    marginLeft: 4,
  },
  eatenButtonTextActive: {
    color: Colors.statusNormal,
  },
  mealTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyLarge.fontSize,
    lineHeight: Typography.bodyLarge.lineHeight,
    fontWeight: '700',
    marginVertical: Spacing.xs,
  },
  mealDescription: {
    color: Colors.secondaryText,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    marginLeft: 2,
  },
  macroDivider: {
    color: Colors.secondaryText,
    marginHorizontal: Spacing.xs,
  },
  mealFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  nutrientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
    marginRight: Spacing.sm,
  },
  nutrientTag: {
    backgroundColor: Colors.borderLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: Radii.sm,
  },
  nutrientTagText: {
    color: Colors.text,
    fontFamily: Typography.caption.fontFamily,
    fontSize: 10,
  },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redTint,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.pills,
  },
  swapButtonText: {
    color: Colors.deepMaroon,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '700',
    marginLeft: 4,
  },
  foodCard: {
    marginBottom: Spacing.sm,
  },
  limitCard: {
    backgroundColor: Colors.redTint,
    borderColor: Colors.border,
  },
  foodCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  foodCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.statusNormalBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  foodLimitCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.statusAbnormalBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  foodNameCol: {
    flex: 1,
  },
  foodName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '700',
  },
  foodCat: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
  },
  foodReasonText: {
    color: Colors.text,
    fontFamily: Typography.body.fontFamily,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    marginVertical: Spacing.xs,
  },
  foodServingText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontStyle: 'italic',
  },
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxActive: {
    backgroundColor: Colors.statusNormal,
    borderColor: Colors.statusNormal,
  },
  groceryDetails: {
    flex: 1,
  },
  groceryName: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.body.fontSize,
  },
  groceryNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.secondaryText,
  },
  groceryCategory: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    marginTop: 2,
  },
  disclaimerWrapper: {
    marginTop: Spacing.xl,
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.cards,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  safetyIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.statusNormalBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  safetyTextCol: {
    flex: 1,
  },
  safetyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  safetyTitle: {
    color: Colors.text,
    fontFamily: Typography.bodyBold.fontFamily,
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: '700',
  },
  verifiedPill: {
    backgroundColor: Colors.statusNormalBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pills,
  },
  verifiedPillText: {
    color: Colors.statusNormal,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  safetySubtitle: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
  },
  safetyBold: {
    color: Colors.text,
    fontWeight: '700',
  },
  groceryProgressRow: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  groceryProgressText: {
    color: Colors.secondaryText,
    fontFamily: Typography.caption.fontFamily,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
});

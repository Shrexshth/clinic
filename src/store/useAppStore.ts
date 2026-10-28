import { create } from 'zustand';
import {
  Biomarker,
  BloodReportData,
  DayMealPlan,
  FoodItemRecommendation,
  GroceryItem,
} from '../data/mock';
import { IProfileRepository, profileRepository, UserProfileEntity } from '../features/profile/repository';
import { IReportRepository, reportRepository } from '../features/reports/repository';
import { INutritionRepository, nutritionRepository } from '../features/nutrition/repository';
import { getDatabase, seedDemoData } from '../db/database';
import { cancelAllAppNotifications } from '../services/notifications';
import { requestAccountDeletion } from '../services/api';

export interface AppState {
  // State
  isLoading: boolean;
  isOnboarded: boolean;
  userProfile: UserProfileEntity | null;
  activeReport: BloodReportData | null;
  flaggedBiomarkers: Biomarker[];
  mealPlans: DayMealPlan[];
  foodRecommendations: FoodItemRecommendation[];
  groceryList: GroceryItem[];

  // Actions
  initialize: () => Promise<void>;
  completeOnboarding: (profile: Omit<UserProfileEntity, 'isOnboarded'>) => Promise<void>;
  loadDemoData: () => Promise<void>;
  toggleMealEaten: (day: string, mealId: string) => Promise<void>;
  swapMeal: (day: string, mealId: string) => Promise<void>;
  toggleGroceryItem: (itemId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfileEntity>) => Promise<void>;
  deleteUserData: () => Promise<void>;
  addNewReport: (report: BloodReportData) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoading: true,
  isOnboarded: false,
  userProfile: null,
  activeReport: null,
  flaggedBiomarkers: [],
  mealPlans: [],
  foodRecommendations: [],
  groceryList: [],

  initialize: async () => {
    try {
      set({ isLoading: true });
      await getDatabase(); // ensure tables are initialized

      const isOnboarded = await profileRepository.isOnboardingCompleted();

      if (isOnboarded) {
        const profile = await profileRepository.getUserProfile();
        const report = await reportRepository.getLatestReport();
        const flagged = await reportRepository.getFlaggedBiomarkers();
        const meals = await nutritionRepository.getMealPlans();
        const foods = await nutritionRepository.getFoodRecommendations();
        const grocery = await nutritionRepository.getGroceryList();

        set({
          isOnboarded: true,
          userProfile: profile,
          activeReport: report,
          flaggedBiomarkers: flagged,
          mealPlans: meals,
          foodRecommendations: foods,
          groceryList: grocery,
          isLoading: false,
        });
      } else {
        set({
          isOnboarded: false,
          userProfile: null,
          isLoading: false,
        });
      }
    } catch (err) {
      console.warn('Error initializing database:', err);
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (profileData) => {
    try {
      const fullProfile: UserProfileEntity = {
        ...profileData,
        isOnboarded: true,
        consentAcceptedAt: new Date().toISOString(),
      };

      await profileRepository.saveUserProfile(fullProfile);

      // Seed initial clinical report and nutrition data into SQLite
      await profileRepository.seedDemoHistory();

      const report = await reportRepository.getLatestReport();
      const flagged = await reportRepository.getFlaggedBiomarkers();
      const meals = await nutritionRepository.getMealPlans();
      const foods = await nutritionRepository.getFoodRecommendations();
      const grocery = await nutritionRepository.getGroceryList();

      set({
        isOnboarded: true,
        userProfile: fullProfile,
        activeReport: report,
        flaggedBiomarkers: flagged,
        mealPlans: meals,
        foodRecommendations: foods,
        groceryList: grocery,
      });
    } catch (err) {
      console.warn('Error completing onboarding:', err);
    }
  },

  loadDemoData: async () => {
    try {
      await profileRepository.seedDemoHistory();

      const profile = await profileRepository.getUserProfile();
      const report = await reportRepository.getLatestReport();
      const flagged = await reportRepository.getFlaggedBiomarkers();
      const meals = await nutritionRepository.getMealPlans();
      const foods = await nutritionRepository.getFoodRecommendations();
      const grocery = await nutritionRepository.getGroceryList();

      set({
        isOnboarded: true,
        userProfile: profile,
        activeReport: report,
        flaggedBiomarkers: flagged,
        mealPlans: meals,
        foodRecommendations: foods,
        groceryList: grocery,
      });
    } catch (err) {
      console.warn('Error loading demo data:', err);
    }
  },

  toggleMealEaten: async (day, mealId) => {
    await nutritionRepository.toggleMealEaten(day, mealId);
    const meals = await nutritionRepository.getMealPlans();
    set({ mealPlans: meals });
  },

  swapMeal: async (day, mealId) => {
    await nutritionRepository.swapMeal(day, mealId);
    const meals = await nutritionRepository.getMealPlans();
    set({ mealPlans: meals });
  },

  toggleGroceryItem: async (itemId) => {
    await nutritionRepository.toggleGroceryItem(itemId);
    const grocery = await nutritionRepository.getGroceryList();
    set({ groceryList: [...grocery] });
  },

  updateProfile: async (updates) => {
    const updated = await profileRepository.updateUserProfile(updates);
    set({ userProfile: updated });
  },

  deleteUserData: async () => {
    try {
      // 1. Cancel all scheduled local notifications
      await cancelAllAppNotifications();
      // 2. Request remote account deletion
      await requestAccountDeletion();
      // 3. Wipe all SQLite tables
      await profileRepository.deleteUserData();
      // 4. Reset store state
      set({
        isOnboarded: false,
        userProfile: null,
        activeReport: null,
        flaggedBiomarkers: [],
        mealPlans: [],
        foodRecommendations: [],
        groceryList: [],
      });
    } catch (err) {
      console.warn('Error during complete data deletion:', err);
    }
  },

  addNewReport: async (report: BloodReportData) => {
    await reportRepository.saveNewReport(report);
    const latest = await reportRepository.getLatestReport();
    const flagged = await reportRepository.getFlaggedBiomarkers();
    set({
      activeReport: latest,
      flaggedBiomarkers: flagged,
    });
  },
}));

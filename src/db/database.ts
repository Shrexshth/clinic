import * as SQLite from 'expo-sqlite';
import {
  MOCK_BIOMARKERS,
  MOCK_MEAL_PLANS,
  MOCK_REPORT_DATA,
  MOCK_USER_PROFILE,
  UserProfileData,
  Biomarker,
  BloodReportData,
  DayMealPlan,
  Meal,
} from '../data/mock';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('clinixbridge.db');
    await initTables(dbInstance);
  }
  return dbInstance;
}

export async function initTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      sex TEXT NOT NULL,
      height TEXT,
      weight TEXT,
      diet_type TEXT NOT NULL,
      allergies TEXT NOT NULL,
      goal TEXT NOT NULL,
      is_onboarded INTEGER DEFAULT 0,
      consent_accepted_at TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      lab_name TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      normal_count INTEGER NOT NULL,
      borderline_count INTEGER NOT NULL,
      abnormal_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      flagged_count_message TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS biomarker_results (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      biomarker_key TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      min_range REAL NOT NULL,
      max_range REAL NOT NULL,
      optimal_min REAL NOT NULL,
      optimal_max REAL NOT NULL,
      status TEXT NOT NULL,
      status_label TEXT NOT NULL,
      flagged_reason TEXT,
      what_it_is TEXT NOT NULL,
      why_low_or_high TEXT NOT NULL,
      foods_that_help TEXT NOT NULL,
      when_to_see_doctor TEXT NOT NULL,
      previous_timeline TEXT NOT NULL,
      progress_chart_data TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meal_plans (
      day TEXT PRIMARY KEY,
      date_label TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meal_items (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein TEXT NOT NULL,
      carbs TEXT NOT NULL,
      fats TEXT NOT NULL,
      is_eaten INTEGER DEFAULT 0,
      description TEXT NOT NULL,
      target_nutrients TEXT NOT NULL,
      key_ingredients TEXT NOT NULL,
      FOREIGN KEY (day) REFERENCES meal_plans (day) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS explanation_cache (
      cache_key TEXT PRIMARY KEY,
      response_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

/**
 * Seeds comprehensive demo report history, biomarker evaluations, and meal plans into SQLite.
 */
export async function seedDemoData(): Promise<void> {
  const db = await getDatabase();

  // 1. Seed or update user profile with demo records
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile (
      id, name, age, sex, height, weight, diet_type, allergies, goal, is_onboarded, consent_accepted_at, email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'current_user',
      MOCK_USER_PROFILE.name,
      MOCK_USER_PROFILE.age,
      MOCK_USER_PROFILE.sex,
      '178 cm',
      '74 kg',
      'non-veg', // veg, non-veg, vegan
      JSON.stringify(MOCK_USER_PROFILE.allergies),
      'Rebuild Iron & Vitality',
      1,
      new Date().toISOString(),
      MOCK_USER_PROFILE.email,
    ]
  );

  // 2. Seed reports
  await db.runAsync(
    `INSERT OR REPLACE INTO reports (
      id, date, lab_name, patient_name, normal_count, borderline_count, abnormal_count, total_count, flagged_count_message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      MOCK_REPORT_DATA.id,
      MOCK_REPORT_DATA.date,
      MOCK_REPORT_DATA.labName,
      MOCK_REPORT_DATA.patientName,
      MOCK_REPORT_DATA.normalCount,
      MOCK_REPORT_DATA.borderlineCount,
      MOCK_REPORT_DATA.abnormalCount,
      MOCK_REPORT_DATA.totalCount,
      MOCK_REPORT_DATA.flaggedCountMessage,
    ]
  );

  // 3. Seed biomarker results
  for (const b of MOCK_BIOMARKERS) {
    await db.runAsync(
      `INSERT OR REPLACE INTO biomarker_results (
        id, report_id, biomarker_key, name, category, value, unit,
        min_range, max_range, optimal_min, optimal_max, status,
        status_label, flagged_reason, what_it_is, why_low_or_high,
        foods_that_help, when_to_see_doctor, previous_timeline, progress_chart_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${MOCK_REPORT_DATA.id}_${b.id}`,
        MOCK_REPORT_DATA.id,
        b.id,
        b.name,
        b.category,
        b.value,
        b.unit,
        b.minRange,
        b.maxRange,
        b.optimalMin,
        b.optimalMax,
        b.status,
        b.statusLabel,
        b.flaggedReason || '',
        b.whatItIs,
        b.whyLowOrHigh,
        JSON.stringify(b.foodsThatHelp),
        b.whenToSeeDoctor,
        JSON.stringify(b.previousTimeline),
        JSON.stringify(b.progressChartData),
      ]
    );
  }

  // 4. Seed meal plans & meal items
  for (const dayPlan of MOCK_MEAL_PLANS) {
    await db.runAsync(
      `INSERT OR REPLACE INTO meal_plans (day, date_label) VALUES (?, ?)`,
      [dayPlan.day, dayPlan.dateLabel]
    );

    for (const meal of dayPlan.meals) {
      await db.runAsync(
        `INSERT OR REPLACE INTO meal_items (
          id, day, type, title, calories, protein, carbs, fats, is_eaten, description, target_nutrients, key_ingredients
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          meal.id,
          dayPlan.day,
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
 * Purges all tables in the SQLite database.
 */
export async function clearAllTables(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM biomarker_results;
    DELETE FROM reports;
    DELETE FROM meal_items;
    DELETE FROM meal_plans;
    DELETE FROM user_profile;
    DELETE FROM explanation_cache;
  `);
}

/**
 * Retrieves a cached AI explanation by cache key.
 */
export async function getCachedExplanation(cacheKey: string): Promise<string | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ response_json: string }>(
      'SELECT response_json FROM explanation_cache WHERE cache_key = ? LIMIT 1',
      [cacheKey]
    );
    return row ? row.response_json : null;
  } catch (err) {
    console.warn('Error reading from explanation cache:', err);
    return null;
  }
}

/**
 * Saves an AI explanation result to the SQLite cache.
 */
export async function saveCachedExplanation(cacheKey: string, responseJson: string): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO explanation_cache (cache_key, response_json, created_at)
       VALUES (?, ?, ?)`,
      [cacheKey, responseJson, new Date().toISOString()]
    );
  } catch (err) {
    console.warn('Error saving to explanation cache:', err);
  }
}


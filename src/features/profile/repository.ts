import { MOCK_USER_PROFILE, UserProfileData } from '../../data/mock';
import { clearAllTables, getDatabase, seedDemoData } from '../../db/database';

export interface UserProfileEntity extends UserProfileData {
  height?: string;
  weight?: string;
  isOnboarded: boolean;
  consentAcceptedAt?: string;
}

export interface IProfileRepository {
  getUserProfile(): Promise<UserProfileEntity | null>;
  saveUserProfile(profile: UserProfileEntity): Promise<UserProfileEntity>;
  updateUserProfile(updates: Partial<UserProfileEntity>): Promise<UserProfileEntity>;
  isOnboardingCompleted(): Promise<boolean>;
  deleteUserData(): Promise<boolean>;
  seedDemoHistory(): Promise<void>;
}

interface UserProfileRow {
  id: string;
  name: string;
  age: number;
  sex: string;
  height: string | null;
  weight: string | null;
  diet_type: string;
  allergies: string;
  goal: string;
  is_onboarded: number;
  consent_accepted_at: string | null;
  email: string | null;
}

export class SQLiteProfileRepository implements IProfileRepository {
  async getUserProfile(): Promise<UserProfileEntity | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<UserProfileRow>(
      "SELECT * FROM user_profile WHERE id = 'current_user' LIMIT 1"
    );

    if (!row) {
      return null;
    }

    let allergies: string[] = [];
    try {
      allergies = JSON.parse(row.allergies);
    } catch {}

    return {
      name: row.name,
      age: row.age,
      sex: row.sex as any,
      height: row.height || '',
      weight: row.weight || '',
      dietType: row.diet_type,
      allergies,
      goals: [row.goal],
      email: row.email || '',
      isOnboarded: row.is_onboarded === 1,
      consentAcceptedAt: row.consent_accepted_at || undefined,
    };
  }

  async saveUserProfile(profile: UserProfileEntity): Promise<UserProfileEntity> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO user_profile (
        id, name, age, sex, height, weight, diet_type, allergies, goal, is_onboarded, consent_accepted_at, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'current_user',
        profile.name,
        profile.age,
        profile.sex,
        profile.height || '',
        profile.weight || '',
        profile.dietType,
        JSON.stringify(profile.allergies),
        profile.goals[0] || 'Health & Vitality',
        profile.isOnboarded ? 1 : 0,
        profile.consentAcceptedAt || new Date().toISOString(),
        profile.email || '',
      ]
    );

    return profile;
  }

  async updateUserProfile(updates: Partial<UserProfileEntity>): Promise<UserProfileEntity> {
    const current = (await this.getUserProfile()) || {
      name: 'Guest User',
      age: 28,
      sex: 'male',
      height: '175 cm',
      weight: '70 kg',
      dietType: 'veg',
      allergies: [],
      goals: ['Rebuild Vitality'],
      email: '',
      isOnboarded: true,
    };

    const merged: UserProfileEntity = {
      ...current,
      ...updates,
    };

    return this.saveUserProfile(merged);
  }

  async isOnboardingCompleted(): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ is_onboarded: number }>(
      "SELECT is_onboarded FROM user_profile WHERE id = 'current_user' LIMIT 1"
    );
    return row ? row.is_onboarded === 1 : false;
  }

  async deleteUserData(): Promise<boolean> {
    await clearAllTables();
    return true;
  }

  async seedDemoHistory(): Promise<void> {
    await seedDemoData();
  }
}

export const profileRepository: IProfileRepository = new SQLiteProfileRepository();

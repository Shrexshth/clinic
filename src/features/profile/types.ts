import { DietType } from '../nutrition/data/nutritionDatabase';

export type PrimaryHealthGoal =
  | 'energy_vitality'
  | 'metabolic_health'
  | 'cardiovascular'
  | 'longevity_wellness';

export interface UserProfile {
  name: string;
  age: number;
  sex: 'male' | 'female' | 'unspecified';
  diet: DietType;
  primaryGoal: PrimaryHealthGoal;
}

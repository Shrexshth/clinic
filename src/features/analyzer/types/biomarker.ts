export type BiomarkerStatus =
  | 'critical_low'
  | 'low'
  | 'borderline_low'
  | 'optimal'
  | 'borderline_high'
  | 'high'
  | 'critical_high';

export interface BiomarkerRanges {
  criticalLow: number;
  low: number;
  optimalMin: number;
  optimalMax: number;
  high: number;
  criticalHigh: number;
}

export interface BiomarkerRule {
  id: string;
  name: string;
  panelId: string;
  unit: string;
  category: string;
  aliases: string[];
  ranges: BiomarkerRanges;
  description: string;
  implicationsLow: string;
  implicationsHigh: string;
  primaryNutrientTargets: string[];
  foodsToPrioritize: string[];
  foodsToAvoid: string[];
}

export interface PanelRule {
  id: string;
  name: string;
  description: string;
}

export interface BiomarkerRulesData {
  version: string;
  disclaimer: string;
  panels: PanelRule[];
  biomarkers: BiomarkerRule[];
}

export interface BiomarkerEvaluation {
  rule: BiomarkerRule;
  value: number;
  status: BiomarkerStatus;
  statusLabel: string;
  isAbnormal: boolean;
  isCritical: boolean;
  normalizedPosition: number; // 0 (criticalLow) to 1 (criticalHigh), clamped 0..1 for gauge
  deviationMessage: string;
}

export interface BloodReport {
  id: string;
  title: string;
  date: string;
  patientName?: string;
  biomarkers: Record<string, number>;
  notes?: string;
}

export interface ReportSummary {
  reportId: string;
  title: string;
  date: string;
  totalBiomarkers: number;
  optimalCount: number;
  borderlineCount: number;
  flaggedCount: number;
  criticalCount: number;
  wellnessScore: number; // 0 - 100
  evaluations: BiomarkerEvaluation[];
  topConcerns: BiomarkerEvaluation[];
}

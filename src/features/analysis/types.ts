// TODO: These reference ranges and clinical interpretations must be reviewed,
// validated, and calibrated against an accredited, trusted clinical laboratory source
// (e.g., Quest Diagnostics, LabCorp, Mayo Clinic Laboratories, CLSI guidelines)
// before any clinical or production release.

export type BiomarkerSex = 'male' | 'female' | 'any';

export type RangeStatus = 'Low' | 'Borderline' | 'Normal' | 'High' | 'not assessed';

export interface AgeBandRange {
  sex?: BiomarkerSex;
  minAge?: number;
  maxAge?: number;
  unit: string;
  // Threshold boundaries
  normalMin: number;
  normalMax: number;
  borderlineLowMin?: number; // if present, values in [borderlineLowMin, normalMin) are Borderline
  borderlineHighMax?: number; // if present, values in (normalMax, borderlineHighMax] are Borderline
  criticalLow?: number;
  criticalHigh?: number;
}

export interface MarkerDefinition {
  id: string;
  name: string;
  canonicalUnit: string;
  category: string;
  aliases: string[];
  unitConversions: Record<string, number>; // multiplier: convertedValue = value * multiplier
  ranges: AgeBandRange[];
  description?: string;
}

export interface ReferenceRangesData {
  version: string;
  lastUpdated: string;
  todoDisclaimer: string;
  markers: MarkerDefinition[];
}

export interface EvaluationOptions {
  unit?: string;
  sex?: BiomarkerSex;
  age?: number;
}

export interface EvaluationResult {
  markerId: string | null;
  markerName: string | null;
  status: RangeStatus;
  originalValue: number;
  originalUnit: string | null;
  convertedValue: number | null;
  standardUnit: string | null;
  rangeUsed: AgeBandRange | null;
  note?: string;
}

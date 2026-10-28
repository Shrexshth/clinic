import rulesData from '../data/biomarkerRules.json';
import {
  BiomarkerEvaluation,
  BiomarkerRule,
  BiomarkerRulesData,
  BiomarkerStatus,
  BloodReport,
  ReportSummary,
} from '../types/biomarker';

const typedRules = rulesData as unknown as BiomarkerRulesData;

export const BIOMARKER_RULES: BiomarkerRule[] = typedRules.biomarkers;
export const PANELS = typedRules.panels;
export const MEDICAL_DISCLAIMER = typedRules.disclaimer;

export function getRuleById(id: string): BiomarkerRule | undefined {
  return BIOMARKER_RULES.find((r) => r.id === id);
}

/**
 * Deterministically evaluates a single biomarker value against reference ranges.
 * Never uses an LLM.
 */
export function evaluateBiomarker(
  rule: BiomarkerRule,
  value: number
): BiomarkerEvaluation {
  const { criticalLow, low, optimalMin, optimalMax, high, criticalHigh } =
    rule.ranges;

  let status: BiomarkerStatus = 'optimal';
  let statusLabel = 'Optimal';
  let deviationMessage = 'Within optimal laboratory range';

  if (value <= criticalLow) {
    status = 'critical_low';
    statusLabel = 'Critical Low';
    deviationMessage = `Significantly below threshold (<${criticalLow} ${rule.unit})`;
  } else if (value < low) {
    status = 'low';
    statusLabel = 'Low';
    deviationMessage = `Below healthy baseline (<${low} ${rule.unit})`;
  } else if (value < optimalMin) {
    status = 'borderline_low';
    statusLabel = 'Borderline Low';
    deviationMessage = `Slightly below optimal target (${optimalMin}-${optimalMax} ${rule.unit})`;
  } else if (value <= optimalMax) {
    status = 'optimal';
    statusLabel = 'Optimal';
    deviationMessage = `Within optimal range (${optimalMin}-${optimalMax} ${rule.unit})`;
  } else if (value < high) {
    status = 'borderline_high';
    statusLabel = 'Borderline Elevated';
    deviationMessage = `Approaching upper limit (optimal: ${optimalMin}-${optimalMax} ${rule.unit})`;
  } else if (value < criticalHigh) {
    status = 'high';
    statusLabel = 'High';
    deviationMessage = `Above standard reference limit (>${high} ${rule.unit})`;
  } else {
    status = 'critical_high';
    statusLabel = 'Critical High';
    deviationMessage = `Severely elevated (>=${criticalHigh} ${rule.unit})`;
  }

  // Calculate normalized 0..1 position along [criticalLow * 0.8, criticalHigh * 1.2]
  const minBound = Math.min(criticalLow * 0.8, low * 0.7);
  const maxBound = Math.max(criticalHigh * 1.2, high * 1.3);
  const rangeSpan = maxBound - minBound;
  const clampedVal = Math.max(minBound, Math.min(maxBound, value));
  const normalizedPosition =
    rangeSpan > 0 ? (clampedVal - minBound) / rangeSpan : 0.5;

  const isCritical = status === 'critical_low' || status === 'critical_high';
  const isAbnormal = isCritical || status === 'low' || status === 'high';

  return {
    rule,
    value,
    status,
    statusLabel,
    isAbnormal,
    isCritical,
    normalizedPosition,
    deviationMessage,
  };
}

/**
 * Summarizes an entire blood report deterministically.
 */
export function summarizeReport(report: BloodReport): ReportSummary {
  const evaluations: BiomarkerEvaluation[] = [];

  for (const [key, val] of Object.entries(report.biomarkers)) {
    const rule = getRuleById(key);
    if (rule && typeof val === 'number' && !isNaN(val)) {
      evaluations.push(evaluateBiomarker(rule, val));
    }
  }

  let optimalCount = 0;
  let borderlineCount = 0;
  let flaggedCount = 0;
  let criticalCount = 0;

  let totalScorePoints = 0;

  for (const ev of evaluations) {
    switch (ev.status) {
      case 'optimal':
        optimalCount++;
        totalScorePoints += 100;
        break;
      case 'borderline_low':
      case 'borderline_high':
        borderlineCount++;
        totalScorePoints += 70;
        break;
      case 'low':
      case 'high':
        flaggedCount++;
        totalScorePoints += 40;
        break;
      case 'critical_low':
      case 'critical_high':
        criticalCount++;
        totalScorePoints += 10;
        break;
    }
  }

  const totalBiomarkers = evaluations.length;
  const wellnessScore =
    totalBiomarkers > 0 ? Math.round(totalScorePoints / totalBiomarkers) : 100;

  // Prioritize top concerns: critical first, then high/low, then borderline
  const topConcerns = evaluations
    .filter((e) => e.status !== 'optimal')
    .sort((a, b) => {
      const severityOrder: Record<BiomarkerStatus, number> = {
        critical_high: 6,
        critical_low: 6,
        high: 4,
        low: 4,
        borderline_high: 2,
        borderline_low: 2,
        optimal: 0,
      };
      return severityOrder[b.status] - severityOrder[a.status];
    });

  return {
    reportId: report.id,
    title: report.title,
    date: report.date,
    totalBiomarkers,
    optimalCount,
    borderlineCount,
    flaggedCount,
    criticalCount,
    wellnessScore,
    evaluations,
    topConcerns,
  };
}

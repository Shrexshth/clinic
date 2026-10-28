import { BIOMARKER_RULES } from './evaluator';

export interface ParseResult {
  biomarkers: Record<string, number>;
  matchedCount: number;
  unrecognizedLines: string[];
}

/**
 * Deterministically parses lab report text lines into structured biomarker entries.
 * Searches for aliases and extracts numerical values.
 */
export function parseLabReportText(rawText: string): ParseResult {
  const result: Record<string, number> = {};
  const unrecognizedLines: string[] = [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let foundMatch = false;

    for (const rule of BIOMARKER_RULES) {
      // Check rule id, rule name, or aliases
      const terms = [rule.name.toLowerCase(), rule.id.toLowerCase(), ...rule.aliases.map((a) => a.toLowerCase())];

      for (const term of terms) {
        if (lowerLine.includes(term)) {
          // Extract numeric value near this term
          // Match standard numbers including decimals like 12.5, 95, 0.8
          const numberMatch = line.match(/(?:[:\-\s=]+)?(\d+(?:\.\d+)?)/);
          if (numberMatch && numberMatch[1]) {
            const val = parseFloat(numberMatch[1]);
            if (!isNaN(val) && val >= 0) {
              result[rule.id] = val;
              foundMatch = true;
              break;
            }
          }
        }
      }
      if (foundMatch) break;
    }

    if (!foundMatch && line.length > 3) {
      unrecognizedLines.push(line);
    }
  }

  return {
    biomarkers: result,
    matchedCount: Object.keys(result).length,
    unrecognizedLines,
  };
}

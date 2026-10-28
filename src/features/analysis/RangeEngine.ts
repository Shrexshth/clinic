// ============================================================================
// RangeEngine.ts
//
// TODO: These reference ranges and clinical interpretations are for demonstration
// and software integration purposes only. They MUST be formally reviewed,
// validated, and calibrated against a certified clinical laboratory source
// (e.g., Quest Diagnostics, LabCorp, Mayo Clinic Laboratories, or CLSI guidelines)
// prior to any clinical release or medical decision-making.
// ============================================================================

import rawRangesData from './referenceRanges.json';
import {
  AgeBandRange,
  BiomarkerSex,
  EvaluationOptions,
  EvaluationResult,
  MarkerDefinition,
  ReferenceRangesData,
} from './types';

export class RangeEngine {
  private data: ReferenceRangesData;
  private aliasMap: Map<string, string> = new Map();
  private markerMap: Map<string, MarkerDefinition> = new Map();

  /**
   * Initializes the RangeEngine with optional custom data.
   * Defaults to bundled referenceRanges.json.
   */
  constructor(customData?: ReferenceRangesData) {
    this.data = customData || (rawRangesData as unknown as ReferenceRangesData);
    this.buildLookupIndexes();
  }

  /**
   * Normalize text for alias lookup:
   * Strips non-alphanumeric characters, converts to lower case, and trims whitespace.
   * e.g., "Hb-A1c (Blood)" -> "hba1cblood", "S. Creatinine" -> "screatinine"
   */
  private normalizeString(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Normalize unit string to match against unitConversions keys.
   * Handles Greek micro symbol (µ) -> u / mc, case insensitivity, etc.
   */
  private normalizeUnit(unit: string): string {
    return unit
      .toLowerCase()
      .trim()
      .replace(/µ/g, 'u')
      .replace(/micro/g, 'u')
      .replace(/\s+/g, '');
  }

  /**
   * Builds quick lookup indexes for markers by ID and aliases.
   */
  private buildLookupIndexes(): void {
    this.aliasMap.clear();
    this.markerMap.clear();

    for (const marker of this.data.markers) {
      this.markerMap.set(marker.id, marker);

      // Map marker id
      this.aliasMap.set(this.normalizeString(marker.id), marker.id);
      // Map marker name
      this.aliasMap.set(this.normalizeString(marker.name), marker.id);

      // Map all configured aliases
      if (Array.isArray(marker.aliases)) {
        for (const alias of marker.aliases) {
          const normalized = this.normalizeString(alias);
          if (normalized) {
            this.aliasMap.set(normalized, marker.id);
          }
        }
      }
    }
  }

  /**
   * Checks whether a marker query exists in the reference range database.
   */
  public isMarkerSupported(query: string): boolean {
    if (!query) return false;
    const normalized = this.normalizeString(query);
    return this.aliasMap.has(normalized);
  }

  /**
   * Finds a marker definition by query string (ID, name, or alias).
   */
  public findMarker(query: string): MarkerDefinition | null {
    if (!query) return null;
    const normalized = this.normalizeString(query);
    const markerId = this.aliasMap.get(normalized);
    if (!markerId) return null;
    return this.markerMap.get(markerId) || null;
  }

  /**
   * Returns a list of all supported canonical marker IDs.
   */
  public getSupportedMarkers(): string[] {
    return Array.from(this.markerMap.keys());
  }

  /**
   * Converts an input value into the canonical unit for a given marker.
   * Returns null if the unit is unsupported or incompatible.
   */
  public convertUnit(
    marker: MarkerDefinition,
    value: number,
    inputUnit?: string
  ): { convertedValue: number; canonicalUnit: string } | null {
    if (!inputUnit) {
      // If no unit provided, assume canonical unit
      return { convertedValue: value, canonicalUnit: marker.canonicalUnit };
    }

    const normInput = this.normalizeUnit(inputUnit);
    const normCanonical = this.normalizeUnit(marker.canonicalUnit);

    // If identical after normalization
    if (normInput === normCanonical) {
      return { convertedValue: value, canonicalUnit: marker.canonicalUnit };
    }

    // Check unit conversions table
    if (marker.unitConversions) {
      for (const [key, multiplier] of Object.entries(marker.unitConversions)) {
        if (this.normalizeUnit(key) === normInput) {
          return {
            convertedValue: value * multiplier,
            canonicalUnit: marker.canonicalUnit,
          };
        }
      }
    }

    return null;
  }

  /**
   * Selects the most specific range for the given patient sex and age.
   */
  public selectRange(
    marker: MarkerDefinition,
    sex?: BiomarkerSex,
    age?: number
  ): AgeBandRange | null {
    if (!marker.ranges || marker.ranges.length === 0) {
      return null;
    }

    const targetSex = sex === 'male' || sex === 'female' ? sex : 'any';

    // 1. Exact sex match and age within [minAge, maxAge]
    if (age !== undefined && targetSex !== 'any') {
      const match = marker.ranges.find((r) => {
        const sexMatch = r.sex === targetSex;
        const minOk = r.minAge === undefined || age >= r.minAge;
        const maxOk = r.maxAge === undefined || age <= r.maxAge;
        return sexMatch && minOk && maxOk;
      });
      if (match) return match;
    }

    // 2. Exact sex match (adult fallback or any age)
    if (targetSex !== 'any') {
      const match = marker.ranges.find((r) => r.sex === targetSex);
      if (match) return match;
    }

    // 3. Fallback to 'any' sex with matching age band
    if (age !== undefined) {
      const match = marker.ranges.find((r) => {
        const sexMatch = !r.sex || r.sex === 'any';
        const minOk = r.minAge === undefined || age >= r.minAge;
        const maxOk = r.maxAge === undefined || age <= r.maxAge;
        return sexMatch && minOk && maxOk;
      });
      if (match) return match;
    }

    // 4. Fallback to 'any' sex
    const anyMatch = marker.ranges.find((r) => !r.sex || r.sex === 'any');
    if (anyMatch) return anyMatch;

    // 5. Default to the first available range
    return marker.ranges[0];
  }

  /**
   * Evaluates a lab test result.
   * Maps value to 'Low', 'Borderline', 'Normal', or 'High'.
   * Unknown markers are labelled "not assessed", NEVER guessed.
   */
  public evaluate(
    markerQuery: string,
    value: number,
    options?: EvaluationOptions
  ): EvaluationResult {
    const originalUnit = options?.unit ?? null;

    // 1. Validate numerical input
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        markerId: null,
        markerName: null,
        status: 'not assessed',
        originalValue: value,
        originalUnit,
        convertedValue: null,
        standardUnit: null,
        rangeUsed: null,
        note: 'Invalid numerical value provided',
      };
    }

    // 2. Find marker in reference database
    const marker = this.findMarker(markerQuery);
    if (!marker) {
      // Safety rule: Unknown markers are strictly "not assessed", never guessed!
      return {
        markerId: null,
        markerName: null,
        status: 'not assessed',
        originalValue: value,
        originalUnit,
        convertedValue: null,
        standardUnit: null,
        rangeUsed: null,
        note: `Marker "${markerQuery}" not assessed: not recognized in clinical reference database`,
      };
    }

    // 3. Unit Conversion
    let convertedValue = value;
    let standardUnit = marker.canonicalUnit;

    if (originalUnit) {
      const conversion = this.convertUnit(marker, value, originalUnit);
      if (!conversion) {
        return {
          markerId: marker.id,
          markerName: marker.name,
          status: 'not assessed',
          originalValue: value,
          originalUnit,
          convertedValue: null,
          standardUnit: marker.canonicalUnit,
          rangeUsed: null,
          note: `Unsupported unit "${originalUnit}" for marker ${marker.name}. Canonical unit is ${marker.canonicalUnit}`,
        };
      }
      convertedValue = conversion.convertedValue;
      standardUnit = conversion.canonicalUnit;
    }

    // 4. Range selection based on sex and age
    const rangeUsed = this.selectRange(marker, options?.sex, options?.age);
    if (!rangeUsed) {
      return {
        markerId: marker.id,
        markerName: marker.name,
        status: 'not assessed',
        originalValue: value,
        originalUnit,
        convertedValue,
        standardUnit,
        rangeUsed: null,
        note: 'No reference range defined for given demographic parameters',
      };
    }

    // 5. Categorization: Low, Borderline, Normal, High
    // Precision rounding to avoid floating point artifact issues
    const roundedValue = Math.round(convertedValue * 10000) / 10000;
    let status: 'Low' | 'Borderline' | 'Normal' | 'High';

    if (roundedValue < rangeUsed.normalMin) {
      if (
        rangeUsed.borderlineLowMin !== undefined &&
        roundedValue >= rangeUsed.borderlineLowMin
      ) {
        status = 'Borderline';
      } else {
        status = 'Low';
      }
    } else if (roundedValue > rangeUsed.normalMax) {
      if (
        rangeUsed.borderlineHighMax !== undefined &&
        roundedValue <= rangeUsed.borderlineHighMax
      ) {
        status = 'Borderline';
      } else {
        status = 'High';
      }
    } else {
      status = 'Normal';
    }

    return {
      markerId: marker.id,
      markerName: marker.name,
      status,
      originalValue: value,
      originalUnit,
      convertedValue: roundedValue,
      standardUnit,
      rangeUsed,
    };
  }

  /**
   * Batch evaluate multiple lab results in one call.
   */
  public evaluateBatch(
    items: Array<{ markerQuery: string; value: number; unit?: string }>,
    options?: EvaluationOptions
  ): EvaluationResult[] {
    return items.map((item) =>
      this.evaluate(item.markerQuery, item.value, {
        ...options,
        unit: item.unit ?? options?.unit,
      })
    );
  }
}

// Export default singleton instance for convenience
export const rangeEngine = new RangeEngine();

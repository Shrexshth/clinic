// ============================================================================
// api.test.ts
//
// Unit tests for the report extraction and explanation services.
// Verifies mock parser structure, confidence metrics, error classes,
// explainReport static fallback, deterministic cache keys, and safety rules.
// ============================================================================

import {
  extractReport,
  explainReport,
  generateStaticExplanations,
  computeExplanationCacheKey,
  BlurryImageError,
  EmptyResultError,
  BiomarkerExplanationInput,
  ProfileExplanationInput,
} from '../api';

describe('extractReport service', () => {
  it('returns structured rows with name, value, unit, labRange, and confidence in offline mock mode', async () => {
    const result = await extractReport({
      uri: 'file:///data/user/0/com.genzclinix/cache/test_lab.jpg',
      name: 'blood_test_june_2026.jpg',
      type: 'image/jpeg',
    });

    expect(result).toBeDefined();
    expect(result.labName).toBeDefined();
    expect(result.rows.length).toBeGreaterThan(0);

    for (const row of result.rows) {
      expect(typeof row.name).toBe('string');
      expect(typeof row.value).toBe('number');
      expect(typeof row.unit).toBe('string');
      expect(typeof row.confidence).toBe('number');
      expect(row.confidence).toBeGreaterThanOrEqual(0);
      expect(row.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it('includes low-confidence biomarkers to test review screen highlights', async () => {
    const result = await extractReport({
      uri: 'file:///cache/sample.jpg',
      name: 'sample_report.jpg',
    });

    const lowConfidenceRows = result.rows.filter((r) => r.confidence < 0.75);
    expect(lowConfidenceRows.length).toBeGreaterThan(0);
  });

  it('throws BlurryImageError when blurry image is detected', async () => {
    await expect(
      extractReport({
        uri: 'file:///cache/blurry_photo.jpg',
        name: 'blurry_camera_capture.jpg',
      })
    ).rejects.toThrow(BlurryImageError);
  });

  it('throws EmptyResultError when empty document is processed', async () => {
    await expect(
      extractReport({
        uri: 'file:///cache/blank_page.pdf',
        name: 'empty_document.pdf',
      })
    ).rejects.toThrow(EmptyResultError);
  });
});

describe('explainReport service & Safety Rules', () => {
  const sampleBiomarkers: BiomarkerExplanationInput[] = [
    {
      biomarkerKey: 'hemoglobin',
      biomarkerName: 'Hemoglobin',
      value: 11.2,
      unit: 'g/dL',
      status: 'abnormal',
      statusLabel: 'Low',
      normalMin: 13.8,
      normalMax: 17.2,
    },
    {
      biomarkerKey: 'fasting_glucose',
      biomarkerName: 'Fasting Glucose',
      value: 118,
      unit: 'mg/dL',
      status: 'borderline',
      statusLabel: 'Borderline',
      normalMin: 70,
      normalMax: 99,
    },
  ];

  const sampleProfile: ProfileExplanationInput = {
    age: 29,
    sex: 'male',
    diet: 'veg',
    allergies: ['peanuts', 'tree nuts'],
  };

  it('computes deterministic cache key regardless of biomarker input order', () => {
    const key1 = computeExplanationCacheKey(sampleBiomarkers, sampleProfile);
    const key2 = computeExplanationCacheKey([sampleBiomarkers[1], sampleBiomarkers[0]], sampleProfile);
    expect(key1).toBe(key2);
  });

  it('generates structured static explanations adhering to safety rules', () => {
    const result = generateStaticExplanations(sampleBiomarkers, sampleProfile);

    expect(result.disclaimer).toContain('Informational only, not medical advice');
    expect(result.explanations).toHaveLength(2);

    for (const exp of result.explanations) {
      expect(exp.biomarkerKey).toBeDefined();
      expect(exp.plainLanguageExplanation.length).toBeGreaterThan(15);
      expect(exp.possibleCauses.length).toBeGreaterThan(0);
      expect(exp.foodSuggestions.length).toBeGreaterThan(0);
      expect(exp.whenToSeeDoctor).toBeDefined();

      // Food suggestion structure: { food, reason }
      for (const food of exp.foodSuggestions) {
        expect(typeof food.food).toBe('string');
        expect(typeof food.reason).toBe('string');
        expect(food.reason.length).toBeGreaterThan(5);
      }
    }
  });

  it('strictly excludes meat for vegetarian diet and excludes declared allergens', () => {
    const vegResult = generateStaticExplanations(
      [
        {
          biomarkerKey: 'hemoglobin',
          biomarkerName: 'Hemoglobin',
          value: 10.5,
          unit: 'g/dL',
          status: 'abnormal',
        },
      ],
      {
        diet: 'veg',
        allergies: ['beef', 'salmon', 'nuts'],
      }
    );

    const foods = vegResult.explanations[0].foodSuggestions.map((f) => f.food.toLowerCase());
    for (const food of foods) {
      expect(food).not.toContain('beef');
      expect(food).not.toContain('bison');
      expect(food).not.toContain('meat');
      expect(food).not.toContain('salmon');
      expect(food).not.toContain('nuts');
    }
  });
});

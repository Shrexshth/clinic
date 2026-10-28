// ============================================================================
// RangeEngine.test.ts
//
// TODO: These reference ranges and test validations must be reviewed against
// a trusted clinical laboratory source before production release.
// ============================================================================

import { RangeEngine } from '../RangeEngine';
import referenceData from '../referenceRanges.json';

describe('RangeEngine & Reference Ranges', () => {
  let engine: RangeEngine;

  beforeEach(() => {
    engine = new RangeEngine();
  });

  describe('Biomarker Coverage & Data Integrity', () => {
    it('covers at least 40 common clinical markers', () => {
      const markers = engine.getSupportedMarkers();
      expect(markers.length).toBeGreaterThanOrEqual(40);
      expect(referenceData.markers.length).toBeGreaterThanOrEqual(40);
    });

    it('contains all mandatory clinical markers', () => {
      const required = [
        'hemoglobin',
        'rbc',
        'wbc',
        'platelets',
        'fasting_glucose',
        'hba1c',
        'total_cholesterol',
        'ldl_cholesterol',
        'hdl_cholesterol',
        'triglycerides',
        'vitamin_d',
        'vitamin_b12',
        'ferritin',
        'iron',
        'tsh',
        'free_t3',
        'free_t4',
        'creatinine',
        'urea',
        'uric_acid',
        'sgpt_alt',
        'sgot_ast',
        'calcium',
        'sodium',
        'potassium',
        'chloride',
        'albumin',
        'total_bilirubin',
        'direct_bilirubin',
        'alkaline_phosphatase',
        'total_protein',
        'globulin',
        'egfr',
        'magnesium',
        'phosphorus',
        'hematocrit',
        'mcv',
        'mch',
        'mchc',
        'rdw',
        'esr',
        'neutrophils',
        'lymphocytes',
        'monocytes',
        'eosinophils',
        'basophils',
      ];

      for (const markerId of required) {
        expect(engine.isMarkerSupported(markerId)).toBe(true);
      }
    });

    it('includes clinical review TODO disclaimer in reference data', () => {
      expect(referenceData.TODO).toContain('clinical laboratory source');
      expect(referenceData.todoDisclaimer).toContain('TODO');
    });
  });

  describe('Alias Resolution', () => {
    it('resolves aliases case-insensitively and with punctuation/spaces', () => {
      // Hemoglobin
      expect(engine.findMarker('Hb')?.id).toBe('hemoglobin');
      expect(engine.findMarker('haemoglobin')?.id).toBe('hemoglobin');
      expect(engine.findMarker('HGB')?.id).toBe('hemoglobin');
      expect(engine.findMarker('Total Hemoglobin')?.id).toBe('hemoglobin');

      // Fasting Glucose
      expect(engine.findMarker('FBS')?.id).toBe('fasting_glucose');
      expect(engine.findMarker('Fasting Blood Sugar')?.id).toBe('fasting_glucose');
      expect(engine.findMarker('glucose fasting')?.id).toBe('fasting_glucose');

      // HbA1c
      expect(engine.findMarker('A1C')?.id).toBe('hba1c');
      expect(engine.findMarker('Hb-A1c')?.id).toBe('hba1c');
      expect(engine.findMarker('Glycated Hemoglobin')?.id).toBe('hba1c');

      // Liver enzymes
      expect(engine.findMarker('ALT')?.id).toBe('sgpt_alt');
      expect(engine.findMarker('SGPT')?.id).toBe('sgpt_alt');
      expect(engine.findMarker('AST')?.id).toBe('sgot_ast');
      expect(engine.findMarker('SGOT')?.id).toBe('sgot_ast');

      // Kidney & Thyroid
      expect(engine.findMarker('Creat')?.id).toBe('creatinine');
      expect(engine.findMarker('BUN')?.id).toBe('urea');
      expect(engine.findMarker('TSH')?.id).toBe('tsh');
      expect(engine.findMarker('FT3')?.id).toBe('free_t3');
      expect(engine.findMarker('FT4')?.id).toBe('free_t4');
    });
  });

  describe('Status Mapping: Normal, Borderline, Low, High', () => {
    it('evaluates normal fasting glucose', () => {
      const result = engine.evaluate('Fasting Glucose', 85, { unit: 'mg/dL' });
      expect(result.status).toBe('Normal');
      expect(result.convertedValue).toBe(85);
      expect(result.rangeUsed?.normalMin).toBe(70);
      expect(result.rangeUsed?.normalMax).toBe(99);
    });

    it('evaluates borderline prediabetes fasting glucose (100 - 125 mg/dL)', () => {
      const result = engine.evaluate('fasting_glucose', 110, { unit: 'mg/dL' });
      expect(result.status).toBe('Borderline');
    });

    it('evaluates high fasting glucose (> 125 mg/dL)', () => {
      const result = engine.evaluate('fasting_glucose', 140, { unit: 'mg/dL' });
      expect(result.status).toBe('High');
    });

    it('evaluates low fasting glucose (< 70 mg/dL)', () => {
      const result = engine.evaluate('fasting_glucose', 62, { unit: 'mg/dL' });
      expect(result.status).toBe('Low');
    });

    it('evaluates vitamin D deficiency (Low) vs insufficiency (Borderline) vs sufficiency (Normal)', () => {
      const lowResult = engine.evaluate('Vitamin D', 14, { unit: 'ng/mL' });
      expect(lowResult.status).toBe('Low');

      const borderlineResult = engine.evaluate('Vitamin D', 24, { unit: 'ng/mL' });
      expect(borderlineResult.status).toBe('Borderline');

      const normalResult = engine.evaluate('Vitamin D', 45, { unit: 'ng/mL' });
      expect(normalResult.status).toBe('Normal');
    });

    it('evaluates Vitamin B12 borderline and normal', () => {
      const borderline = engine.evaluate('Vitamin B12', 250, { unit: 'pg/mL' });
      expect(borderline.status).toBe('Borderline');

      const normal = engine.evaluate('Vitamin B12', 550, { unit: 'pg/mL' });
      expect(normal.status).toBe('Normal');
    });
  });

  describe('Demographic Range Selection: Sex and Age bands', () => {
    it('applies male vs female reference ranges for Hemoglobin', () => {
      // 12.5 g/dL is Normal for female (12.1 - 15.1), but Low for male (13.8 - 17.2)
      const maleEval = engine.evaluate('Hemoglobin', 12.5, {
        unit: 'g/dL',
        sex: 'male',
        age: 30,
      });
      const femaleEval = engine.evaluate('Hemoglobin', 12.5, {
        unit: 'g/dL',
        sex: 'female',
        age: 30,
      });

      expect(maleEval.rangeUsed?.sex).toBe('male');
      expect(femaleEval.rangeUsed?.sex).toBe('female');
      expect(maleEval.status).toBe('Low');
      expect(femaleEval.status).toBe('Normal');
    });

    it('applies sex-specific ranges for Ferritin and Uric Acid', () => {
      const maleUric = engine.evaluate('Uric Acid', 6.5, { sex: 'male', age: 35 });
      const femaleUric = engine.evaluate('Uric Acid', 6.5, { sex: 'female', age: 35 });

      // Male upper limit is 7.0 mg/dL (6.5 is normal)
      expect(maleUric.status).toBe('Normal');
      // Female upper limit is 6.0 mg/dL (6.5 is borderline/high)
      expect(femaleUric.status).toBe('Borderline');
    });

    it('returns the exact range it used in the evaluation output', () => {
      const evalResult = engine.evaluate('Creatinine', 1.1, {
        sex: 'male',
        age: 40,
        unit: 'mg/dL',
      });
      expect(evalResult.rangeUsed).not.toBeNull();
      expect(evalResult.rangeUsed?.unit).toBe('mg/dL');
      expect(evalResult.rangeUsed?.normalMin).toBe(0.74);
      expect(evalResult.rangeUsed?.normalMax).toBe(1.35);
      expect(evalResult.standardUnit).toBe('mg/dL');
    });
  });

  describe('Unit Conversions', () => {
    it('converts glucose from mmol/L to mg/dL correctly', () => {
      // 5.0 mmol/L * 18.0182 = ~90.09 mg/dL -> Normal
      const result = engine.evaluate('Fasting Glucose', 5.0, { unit: 'mmol/L' });
      expect(result.status).toBe('Normal');
      expect(result.convertedValue).toBeCloseTo(90.09, 1);
      expect(result.standardUnit).toBe('mg/dL');
      expect(result.originalUnit).toBe('mmol/L');
    });

    it('converts cholesterol from mmol/L to mg/dL', () => {
      // 5.2 mmol/L * 38.67 = ~201.08 mg/dL -> Borderline (200-239)
      const result = engine.evaluate('Total Cholesterol', 5.2, { unit: 'mmol/L' });
      expect(result.status).toBe('Borderline');
      expect(result.convertedValue).toBeCloseTo(201.08, 1);
      expect(result.standardUnit).toBe('mg/dL');
    });

    it('converts hemoglobin from g/L to g/dL', () => {
      // 145 g/L * 0.1 = 14.5 g/dL
      const result = engine.evaluate('Hemoglobin', 145, {
        unit: 'g/L',
        sex: 'male',
        age: 30,
      });
      expect(result.convertedValue).toBe(14.5);
      expect(result.status).toBe('Normal');
      expect(result.standardUnit).toBe('g/dL');
    });

    it('converts Vitamin D from nmol/L to ng/mL', () => {
      // 50 nmol/L * 0.40064 = 20.03 ng/mL -> Borderline
      const result = engine.evaluate('Vitamin D', 50, { unit: 'nmol/L' });
      expect(result.convertedValue).toBeCloseTo(20.03, 1);
      expect(result.status).toBe('Borderline');
      expect(result.standardUnit).toBe('ng/mL');
    });

    it('converts Vitamin B12 from pmol/L to pg/mL', () => {
      // 300 pmol/L * 1.355 = 406.5 pg/mL -> Normal
      const result = engine.evaluate('Vitamin B12', 300, { unit: 'pmol/L' });
      expect(result.convertedValue).toBeCloseTo(406.5, 1);
      expect(result.status).toBe('Normal');
      expect(result.standardUnit).toBe('pg/mL');
    });
  });

  describe('Safety Rule: Unknown markers are never guessed', () => {
    it('labels unknown markers as "not assessed"', () => {
      const result = engine.evaluate('Kryptonite Serum Concentration', 42);
      expect(result.status).toBe('not assessed');
      expect(result.markerId).toBeNull();
      expect(result.rangeUsed).toBeNull();
      expect(result.note).toContain('not recognized in clinical reference database');
    });

    it('labels incompatible or unsupported units as "not assessed"', () => {
      const result = engine.evaluate('Fasting Glucose', 90, { unit: 'lightyears/second' });
      expect(result.status).toBe('not assessed');
      expect(result.rangeUsed).toBeNull();
      expect(result.note).toContain('Unsupported unit');
    });

    it('handles non-numeric or NaN values safely', () => {
      const result = engine.evaluate('Hemoglobin', NaN);
      expect(result.status).toBe('not assessed');
      expect(result.note).toContain('Invalid numerical value');
    });
  });

  describe('Batch Evaluation', () => {
    it('evaluates multiple markers in batch', () => {
      const batch = [
        { markerQuery: 'Hb', value: 14.2, unit: 'g/dL' },
        { markerQuery: 'FBS', value: 115, unit: 'mg/dL' },
        { markerQuery: 'UnknownAlienBiomarker', value: 99 },
      ];
      const results = engine.evaluateBatch(batch, { sex: 'male', age: 30 });

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe('Normal');
      expect(results[1].status).toBe('Borderline');
      expect(results[2].status).toBe('not assessed');
    });
  });
});

// ============================================================================
// /supabase/functions/explain-report/index.ts
//
// Supabase Edge Function: explain-report
// Generates personalized, dietary-adapted explanations for flagged biomarkers
// using Google Gemini Flash with structured JSON output schema.
// Strictly forbids medical diagnosis and medication advice, validates JSON,
// and implements exponential backoff on 429 rate limit errors.
// ============================================================================

import { corsHeaders } from '../_shared/cors.ts';

interface BiomarkerInput {
  biomarkerKey: string;
  biomarkerName: string;
  value: number;
  unit: string;
  status: string;
  statusLabel?: string;
  normalMin?: number;
  normalMax?: number;
}

interface ProfileInput {
  age?: number;
  sex?: string;
  diet?: string;
  allergies?: string[];
}

interface FoodSuggestion {
  food: string;
  reason: string;
}

interface BiomarkerExplanation {
  biomarkerKey: string;
  biomarkerName: string;
  plainLanguageExplanation: string;
  possibleCauses: string[];
  foodSuggestions: FoodSuggestion[];
  whenToSeeDoctor: string;
}

interface ExplainReportResponse {
  disclaimer: string;
  explanations: BiomarkerExplanation[];
}

/**
 * Executes fetch to Google Gemini API with exponential backoff on 429 / 503 errors.
 */
async function fetchGeminiWithBackoff(url: string, payload: unknown, maxRetries = 3): Promise<Response> {
  let attempt = 0;
  let delayMs = 1200;

  while (attempt < maxRetries) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.status === 429 || response.status === 503) {
      attempt++;
      if (attempt >= maxRetries) {
        return response;
      }
      const jitter = Math.floor(Math.random() * 500);
      await new Promise((resolve) => setTimeout(resolve, delayMs + jitter));
      delayMs *= 2;
      continue;
    }

    return response;
  }

  throw new Error('Gemini API call failed after multiple retries.');
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Validate API Key from Supabase Secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey || geminiApiKey.trim() === '') {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY secret is not configured in Supabase.',
          code: 'MISSING_API_KEY',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';

    // 3. Parse and Validate Request Payload
    const body = await req.json();
    const biomarkers: BiomarkerInput[] = body.biomarkers || [];
    const profile: ProfileInput = body.profile || {};

    if (!Array.isArray(biomarkers) || biomarkers.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No flagged biomarkers provided in request payload.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dietType = profile.diet || 'balanced';
    const allergiesList =
      Array.isArray(profile.allergies) && profile.allergies.length > 0
        ? profile.allergies.join(', ')
        : 'none';
    const age = profile.age || 30;
    const sex = profile.sex || 'unspecified';

    // 4. Construct System Prompt with Strict Safety Directives
    const systemInstruction = `You are an empathetic, clinical nutrition educator translating lab test results into plain language for health literacy.

PATIENT PROFILE CONTEXT:
- Age: ${age}
- Sex: ${sex}
- Diet Preference: ${dietType}
- Declared Allergies: ${allergiesList}

STRICT MEDICAL SAFETY & COMPLIANCE RULES:
1. NEVER PROVIDE ANY MEDICAL DIAGNOSIS. Never tell the user they "have" a disease or medical condition.
2. NEVER PRESCRIBE, ADVISE ON, OR DISCUSS MEDICATIONS, pharmaceuticals, drug regimens, or dosage changes.
3. STRICT DIETARY ALIGNMENT:
   - If diet is "veg" or vegetarian: NEVER suggest meat, poultry, fish, seafood, or gelatin.
   - If diet is "vegan": NEVER suggest any animal products (no meat, fish, dairy, eggs, or honey).
   - If allergies are present (${allergiesList}): STRICTLY EXCLUDE ANY INGREDIENTS or derived products from that allergen family.
4. MANDATORY DISCLAIMER: You MUST include the exact disclaimer string: "Informational only, not medical advice. Consult a healthcare professional."
5. For each biomarker:
   - plainLanguageExplanation: A clear, accessible 2-3 sentence explanation of the marker's physiological role and what this reading implies.
   - possibleCauses: 3-4 bullet-style lifestyle, dietary, hydration, sleep, or physiological factors.
   - foodSuggestions: 3-5 specific whole foods, each with a concise, one-line nutritional mechanism reason.
   - whenToSeeDoctor: Clear objective guidance on clinical signs or timeline for physician follow-up.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        disclaimer: { type: 'STRING' },
        explanations: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              biomarkerKey: { type: 'STRING' },
              biomarkerName: { type: 'STRING' },
              plainLanguageExplanation: { type: 'STRING' },
              possibleCauses: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              foodSuggestions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    food: { type: 'STRING' },
                    reason: { type: 'STRING' },
                  },
                  required: ['food', 'reason'],
                },
              },
              whenToSeeDoctor: { type: 'STRING' },
            },
            required: [
              'biomarkerKey',
              'biomarkerName',
              'plainLanguageExplanation',
              'possibleCauses',
              'foodSuggestions',
              'whenToSeeDoctor',
            ],
          },
        },
      },
      required: ['disclaimer', 'explanations'],
    };

    const userPrompt = `Generate tailored plain-language explanations and dietary suggestions for the following flagged biomarkers:
${JSON.stringify(biomarkers, null, 2)}

Remember to strictly enforce diet (${dietType}) and exclude allergens (${allergiesList}). Output valid structured JSON only.`;

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    };

    // 5. Invoke Gemini with Retry & Exponential Backoff on 429
    const geminiRes = await fetchGeminiWithBackoff(geminiEndpoint, geminiPayload, 3);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({
          error: `Gemini API returned status ${geminiRes.status}`,
          details: errText,
        }),
        {
          status: geminiRes.status === 429 ? 429 : 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiData = await geminiRes.json();
    const candidateText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return new Response(
        JSON.stringify({ error: 'Gemini returned an empty explanation response.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Validate JSON output
    let parsed: ExplainReportResponse;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON produced by Gemini model.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!parsed.explanations || !Array.isArray(parsed.explanations)) {
      return new Response(
        JSON.stringify({ error: 'Model failed to generate an explanations array.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure all required fields and valid structures
    const validatedExplanations: BiomarkerExplanation[] = parsed.explanations.map((exp) => ({
      biomarkerKey: exp.biomarkerKey || 'unknown',
      biomarkerName: exp.biomarkerName || 'Biomarker',
      plainLanguageExplanation: exp.plainLanguageExplanation || '',
      possibleCauses: Array.isArray(exp.possibleCauses) ? exp.possibleCauses : [],
      foodSuggestions: Array.isArray(exp.foodSuggestions)
        ? exp.foodSuggestions.filter((f) => f && typeof f.food === 'string' && typeof f.reason === 'string')
        : [],
      whenToSeeDoctor: exp.whenToSeeDoctor || 'Consult a healthcare provider for persistent abnormal readings.',
    }));

    const finalResult: ExplainReportResponse = {
      disclaimer: 'Informational only, not medical advice. Consult a healthcare professional.',
      explanations: validatedExplanations,
    };

    return new Response(JSON.stringify(finalResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || 'Internal Edge Function error occurred.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

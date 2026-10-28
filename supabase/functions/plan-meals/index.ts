// ============================================================================
// /supabase/functions/plan-meals/index.ts
//
// Supabase Edge Function: plan-meals
// Drafts a 7-day personalized Indian meal plan using Google Gemini Flash.
// STRICT CONSTRAINT: Chooses foods ONLY from the approved foods.json catalog,
// strictly enforces diet preferences and allergen exclusions, and forbids medical advice.
// ============================================================================

import { corsHeaders } from '../_shared/cors.ts';

interface PlanMealsRequest {
  biomarkers: Array<{ biomarkerKey: string; status: string; value: number }>;
  profile: {
    diet?: string;
    allergies?: string[];
    age?: number;
    sex?: string;
  };
  allowedFoodIds?: string[];
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';
    const body: PlanMealsRequest = await req.json();

    const dietType = body.profile?.diet || 'balanced';
    const allergies = body.profile?.allergies || [];
    const allergiesStr = allergies.length > 0 ? allergies.join(', ') : 'none';

    const systemInstruction = `You are a clinical nutritionist designing a 7-day Indian meal plan (Monday to Sunday) tailored to flagged blood biomarkers.
STRICT OPERATIONAL RULES:
1. ONLY select foods from the provided list of allowed Indian foods.
2. NEVER include any meal containing declared allergens: ${allergiesStr}.
3. STRICTLY respect dietary preference: ${dietType} (e.g. if veg or vegan, never select meat, chicken, or fish).
4. NEVER provide medical diagnosis or medication advice.
5. MUST include the disclaimer: "Informational only, not medical advice. Consult a healthcare professional."
6. Ensure variety across breakfast, lunch, snack, and dinner across the 7 days.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        disclaimer: { type: 'STRING' },
        days: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              day: { type: 'STRING' },
              breakfastFoodId: { type: 'STRING' },
              lunchFoodId: { type: 'STRING' },
              snackFoodId: { type: 'STRING' },
              dinnerFoodId: { type: 'STRING' },
              dailyFocus: { type: 'STRING' },
            },
            required: ['day', 'breakfastFoodId', 'lunchFoodId', 'snackFoodId', 'dinnerFoodId'],
          },
        },
      },
      required: ['disclaimer', 'days'],
    };

    const userPrompt = `Draft a 7-day Indian meal plan tailored for:
Biomarkers: ${JSON.stringify(body.biomarkers || [])}
Diet: ${dietType}
Allergens to avoid: ${allergiesStr}
Allowed food IDs: ${JSON.stringify(body.allowedFoodIds || [])}`;

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

    const geminiRes = await fetchGeminiWithBackoff(geminiEndpoint, geminiPayload, 3);
    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error ${geminiRes.status}: ${errText}` }),
        { status: geminiRes.status === 429 ? 429 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await geminiRes.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return new Response(
        JSON.stringify({ error: 'Gemini returned empty meal plan response.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(candidateText);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Edge Function execution error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

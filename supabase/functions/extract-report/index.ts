// ============================================================================
// /supabase/functions/extract-report/index.ts
//
// Supabase Edge Function: extract-report
// Parses blood test report images and PDFs using Google Gemini Vision API.
// Enforces structured JSON output, strict safety rules (no diagnosis or medication),
// response validation, and handles 429 rate limits with exponential backoff.
// ============================================================================

import { corsHeaders } from '../_shared/cors.ts';

interface ExtractedRow {
  name: string;
  value: number;
  unit: string;
  labRange?: string;
  confidence: number;
}

interface ExtractionResponse {
  labName: string;
  patientName?: string | null;
  reportDate?: string | null;
  disclaimer: string;
  rows: ExtractedRow[];
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

    // 3. Extract File Data (supports JSON base64 or multipart/form-data)
    let base64Data = '';
    let mimeType = 'image/jpeg';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      base64Data = body.fileBase64 || body.base64 || '';
      mimeType = body.mimeType || body.type || 'image/jpeg';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = await (file as Blob).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64Data = btoa(binary);
        mimeType = (file as Blob).type || 'image/jpeg';
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported Content-Type. Send JSON or multipart/form-data.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!base64Data) {
      return new Response(
        JSON.stringify({ error: 'No file data or base64 provided in request.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Construct Gemini Request with Vision & Structured Output Schema
    const systemInstruction = `You are a clinical laboratory document optical recognition specialist.
Your task is to accurately extract all blood test biomarkers, values, measurement units, reference intervals, and OCR confidence from the provided lab test document.

STRICT MEDICAL SAFETY RULES:
1. NEVER provide any medical diagnosis, diagnostic interpretation, or clinical condition labeling.
2. NEVER prescribe, recommend, or discuss pharmaceutical medications, drug therapies, or dosage adjustments.
3. You MUST include the mandatory disclaimer: "Informational only, not medical advice."
4. If a marker or numerical value is smudged, blurry, or uncertain, assign an appropriate lower confidence score (between 0.1 and 0.7) so the user can verify it manually.
5. Extract ALL identified blood biomarkers. Values must be numeric numbers.`;

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        labName: { type: 'STRING' },
        patientName: { type: 'STRING' },
        reportDate: { type: 'STRING' },
        disclaimer: { type: 'STRING' },
        rows: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              name: { type: 'STRING' },
              value: { type: 'NUMBER' },
              unit: { type: 'STRING' },
              labRange: { type: 'STRING' },
              confidence: { type: 'NUMBER' },
            },
            required: ['name', 'value', 'unit', 'confidence'],
          },
        },
      },
      required: ['labName', 'rows', 'disclaimer'],
    };

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Extract all blood test biomarker rows from this laboratory report document into the structured JSON schema. Enforce strict numerical values and optical confidence.',
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    };

    // 5. Invoke Gemini with retry & exponential backoff on 429
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
        JSON.stringify({ error: 'Gemini returned an empty response.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Validate Output JSON
    let parsed: ExtractionResponse;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON produced by Gemini model.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate structure & safety constraints
    if (!parsed.rows || !Array.isArray(parsed.rows)) {
      return new Response(
        JSON.stringify({ error: 'Model failed to generate a valid rows array.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize rows and ensure required fields
    const validatedRows: ExtractedRow[] = parsed.rows
      .filter((r) => r && typeof r.name === 'string' && typeof r.value === 'number' && !isNaN(r.value))
      .map((r) => ({
        name: r.name.trim(),
        value: r.value,
        unit: (r.unit || '').trim(),
        labRange: r.labRange ? String(r.labRange).trim() : undefined,
        confidence: typeof r.confidence === 'number' ? Math.max(0, Math.min(1, r.confidence)) : 0.85,
      }));

    const finalResult: ExtractionResponse = {
      labName: parsed.labName || 'Diagnostic Laboratory',
      patientName: parsed.patientName || null,
      reportDate: parsed.reportDate || new Date().toISOString().split('T')[0],
      disclaimer: 'Informational only, not medical advice.',
      rows: validatedRows,
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

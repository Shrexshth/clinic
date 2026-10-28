// ============================================================================
// /supabase/functions/_shared/cors.ts
// Standard CORS headers for Supabase Edge Functions (Deno runtime)
// ============================================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

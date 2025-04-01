import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";

// Define CORS headers with explicit types
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin'
} as const;

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create a response with CORS headers
const createResponse = (body: unknown, status = 200) => {
  const origin = '*';
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      }
    }
  );
};

serve(async (req) => {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Verify request method
    if (req.method !== 'POST') {
      return createResponse(
        { error: `Method ${req.method} not allowed` },
        405
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createResponse(
        { error: 'Missing authorization header' },
        401
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return createResponse(
        { error: 'Invalid JSON in request body' },
        400
      );
    }

    const { purchaseId, userId } = body;

    if (!purchaseId || !userId) {
      return createResponse(
        { error: 'Missing required parameters: purchaseId and userId are required' },
        400
      );
    }

    // Get purchase details with track information
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        tracks (
          id,
          processed_file
        )
      `)
      .eq('id', purchaseId)
      .single();

    if (purchaseError) {
      return createResponse(
        { error: `Failed to fetch purchase: ${purchaseError.message}` },
        404
      );
    }

    if (!purchase) {
      return createResponse(
        { error: 'Purchase not found' },
        404
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return createResponse(
        { error: 'User profile not found' },
        404
      );
    }

    // Generate download URL
    const { data: downloadUrl, error: urlError } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(purchase.tracks.processed_file, 604800); // 7 days

    if (urlError || !downloadUrl?.signedUrl) {
      return createResponse(
        { error: 'Failed to generate download URL' },
        500
      );
    }

    // Update purchase status
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ status: 'completed' })
      .eq('id', purchaseId);

    if (updateError) {
      return createResponse(
        { error: `Failed to update purchase status: ${updateError.message}` },
        500
      );
    }

    // Return success response with CORS headers
    return createResponse({
      success: true,
      downloadUrl: downloadUrl.signedUrl
    });

  } catch (error) {
    console.error('Error handling payment success:', error);

    return createResponse(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      500
    );
  }
});
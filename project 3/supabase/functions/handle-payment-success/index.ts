import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";
import nodemailer from "npm:nodemailer@6.9.12";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin'
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize SMTP transporter
const smtpHost = Deno.env.get('SMTP_HOST');
const smtpPort = Deno.env.get('SMTP_PORT');
const smtpUsername = Deno.env.get('SMTP_USERNAME');
const smtpPassword = Deno.env.get('SMTP_PASSWORD');

if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
  throw new Error('Missing SMTP environment variables');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: parseInt(smtpPort),
  secure: true,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

// Helper function to create a response with CORS headers
const createResponse = (body: unknown, status = 200) => {
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
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
    const { userId, trackId } = await req.json();

    if (!userId || !trackId) {
      return createResponse(
        { error: 'Missing required parameters: userId and trackId are required' },
        400
      );
    }

    // Get track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('processed_file')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return createResponse(
        { error: 'Track not found' },
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
      .createSignedUrl(track.processed_file, 604800); // 7 days

    if (urlError || !downloadUrl?.signedUrl) {
      return createResponse(
        { error: 'Failed to generate download URL' },
        500
      );
    }

    // Send email notification
    try {
      await transporter.sendMail({
        from: 'noreply@far.com',
        to: profile.email,
        subject: 'Your Mastered Track is Ready!',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h1 style="color: #2563eb;">Your Mastered Track is Ready!</h1>
              <p>Thank you for using Famous Artist Remastered!</p>
              <p>Your mastered track is ready for download. Click the link below:</p>
              <p>
                <a 
                  href="${downloadUrl.signedUrl}" 
                  style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;"
                >
                  Download Mastered Track
                </a>
              </p>
              <p><strong>Note:</strong> This download link will expire in 7 days.</p>
              <p>Enjoy your professionally mastered track!</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="font-size: 12px; color: #6b7280;">
                If you didn't request this download, please ignore this email.
              </p>
            </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue execution - email failure shouldn't block the download
    }

    // Update purchase status
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ status: 'completed' })
      .eq('user_id', userId)
      .eq('track_id', trackId)
      .eq('status', 'pending');

    if (updateError) {
      return createResponse(
        { error: `Failed to update purchase status: ${updateError.message}` },
        500
      );
    }

    // Return success response
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
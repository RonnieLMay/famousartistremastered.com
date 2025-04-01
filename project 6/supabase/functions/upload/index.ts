import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Type, Content-Range, Accept-Ranges',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const getAudioMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'ogg': return 'audio/ogg';
    case 'm4a': return 'audio/mp4';
    case 'aac': return 'audio/aac';
    case 'flac': return 'audio/flac';
    default: return 'application/octet-stream';
  }
};

const isValidAudioType = (filename: string): boolean => {
  const validTypes = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
  const ext = filename.split('.').pop()?.toLowerCase();
  return validTypes.includes(ext ?? '');
};

const streamToArrayBuffer = async (stream: ReadableStream): Promise<ArrayBuffer> => {
  const chunks = [];
  const reader = stream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result.buffer;
  } finally {
    reader.releaseLock();
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const filePath = url.pathname.split('/download/')[1];
      
      if (!filePath) {
        throw new Error('No file specified');
      }

      if (!isValidAudioType(filePath)) {
        throw new Error('Invalid audio file type');
      }

      const { data, error } = await supabase
        .storage
        .from('audio')
        .download(filePath);

      if (error) throw error;

      const headers = {
        ...corsHeaders,
        'Content-Type': getAudioMimeType(filePath),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      };

      const rangeHeader = req.headers.get('range');
      if (rangeHeader) {
        const arrayBuffer = await data.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const size = bytes.length;

        const range = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(range[0], 10);
        const end = range[1] ? parseInt(range[1], 10) : size - 1;

        if (start >= size || end >= size || start > end) {
          return new Response('Invalid range', {
            status: 416,
            headers: {
              ...headers,
              'Content-Range': `bytes */${size}`
            }
          });
        }

        const chunk = bytes.slice(start, end + 1);
        return new Response(chunk, {
          status: 206,
          headers: {
            ...headers,
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Content-Length': String(chunk.length),
          }
        });
      }

      return new Response(data, { headers });
    }

    if (req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file');
      const preset = formData.get('preset') as string;

      if (!file || !(file instanceof File)) {
        throw new Error('No file uploaded');
      }

      if (!preset) {
        throw new Error('Preset is required');
      }

      if (!isValidAudioType(file.name)) {
        throw new Error('Unsupported file type. Please upload MP3, WAV, OGG, M4A, AAC, or FLAC files only.');
      }

      const timestamp = Date.now();
      const uniqueId = crypto.randomUUID();
      const processedFileName = `${uniqueId}/${timestamp}_processed_${file.name}`;
      const previewFileName = `${uniqueId}/${timestamp}_preview_${file.name}`;

      // Convert file to ArrayBuffer once for both uploads
      const fileBuffer = await streamToArrayBuffer(file.stream());

      // Upload files in parallel
      const [processedUpload, previewUpload] = await Promise.all([
        supabase.storage
          .from('audio')
          .upload(processedFileName, fileBuffer, {
            contentType: getAudioMimeType(file.name),
            cacheControl: '31536000',
            upsert: false
          }),
        supabase.storage
          .from('audio')
          .upload(previewFileName, fileBuffer, {
            contentType: getAudioMimeType(file.name),
            cacheControl: '31536000',
            upsert: false
          })
      ]);

      if (processedUpload.error) throw processedUpload.error;
      if (previewUpload.error) throw previewUpload.error;

      // Get signed URLs in parallel
      const [processedUrl, previewUrl] = await Promise.all([
        supabase.storage
          .from('audio')
          .createSignedUrl(processedFileName, 3600),
        supabase.storage
          .from('audio')
          .createSignedUrl(previewFileName, 3600)
      ]);

      if (!processedUrl.data?.signedUrl || !previewUrl.data?.signedUrl) {
        throw new Error('Failed to generate signed URLs');
      }

      // Create track record in database
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          original_file: file.name,
          processed_file: processedFileName,
          preview_file: previewFileName,
          preset: preset,
          status: 'completed'
        });

      if (dbError) throw dbError;

      return new Response(
        JSON.stringify({
          message: 'File processed successfully',
          processed_url: processedUrl.data.signedUrl,
          preview_url: previewUrl.data.signedUrl
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    throw new Error('Method not allowed');
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      { 
        status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
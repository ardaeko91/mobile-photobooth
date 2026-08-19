import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return new NextResponse('File ID missing', { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Ambil tenant pertama untuk token Drive
    const { data: tenant } = await supabaseAdmin
      .from('tenants')
      .select('google_refresh_token')
      .limit(1)
      .single();

    if (!tenant?.google_refresh_token) {
      return new NextResponse('OAuth Token missing', { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: tenant.google_refresh_token });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Download file media dari Drive API
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(response.data);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    console.error('Drive Proxy Error:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}

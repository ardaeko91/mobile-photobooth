import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const tenantId = formData.get('tenantId');
    const eventSlug = formData.get('eventSlug') || 'general';

    if (!file || !tenantId) {
      return NextResponse.json(
        { error: 'File dan tenantId wajib diisi.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .select('google_refresh_token')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant?.google_refresh_token) {
      return NextResponse.json(
        { error: 'Tenant tidak ditemukan atau OAuth Google Drive belum terhubung.' },
        { status: 404 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: tenant.google_refresh_token,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // --- LOGIKA DYNAMIC FOLDER ALLOCATION ---
    const folderName = `Photobooth - ${eventSlug}`;
    let targetFolderId = null;

    // 1. Cari folder berdasarkan nama
    const searchFolder = await drive.files.list({
      q: `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchFolder.data.files && searchFolder.data.files.length > 0) {
      targetFolderId = searchFolder.data.files[0].id;
    } else {
      // 2. Buat folder baru jika belum ada
      const newFolder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      targetFolderId = newFolder.data.id;
    }

    // --- UPLOAD FILE KE DALAM FOLDER ---
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { Readable } = await import('stream');
    const stream = Readable.from(buffer);

    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        parents: targetFolderId ? [targetFolderId] : [],
      },
      media: {
        mimeType: file.type || 'image/jpeg',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    // --- SIMPAN METADATA KE SUPABASE (Tabel photos) ---
    const { data: eventData } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', eventSlug)
      .single();

    if (eventData) {
      await supabaseAdmin.from('photos').insert([
        {
          event_id: eventData.id,
          drive_file_id: driveResponse.data.id,
          drive_url: driveResponse.data.webViewLink,
        },
      ]);
    }

    // --- RESPONSE DIBERIKAN PALING AKHIR ---
    return NextResponse.json({
      success: true,
      fileId: driveResponse.data.id,
      driveUrl: driveResponse.data.webViewLink,
    });

  } catch (error) {
    console.error('API Upload Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
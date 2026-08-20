import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Fungsi penarik Folder ID murni dari URL atau ID mentah
function extractDriveFolderId(input) {
  if (!input) return null;
  
  // Jika input berupa URL (misal: https://drive.google.com/drive/folders/1VePHQog... atau dengan ?usp=...)
  const match = input.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Jika input sudah berupa ID murni tanpa URL (tanpa slash / atau http)
  if (!input.includes('/') && !input.includes('http')) {
    return input.trim();
  }
  
  return null;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const slug = formData.get('slug') || formData.get('eventSlug');

    if (!file) {
      return NextResponse.json(
        { error: 'File foto wajib diunggah.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // 1. Ambil data Event berdasarkan Slug
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (eventError) {
      console.error('Supabase Query Error:', eventError);
      return NextResponse.json(
        { error: `Database Error: ${eventError.message}` },
        { status: 500 }
      );
    }

    if (!eventData) {
      return NextResponse.json(
        { error: `Event dengan slug '${eventSlug}' tidak ditemukan di database.` },
        { status: 404 }
      );
    }

    // Ekstrak ID Folder murni dari URL yang ada di database
    const rawFolderValue = eventData.drive_folder_id || eventData.drive_folder_url || null;
    const cleanFolderId = extractDriveFolderId(rawFolderValue);

    // 2. Inisialisasi Google OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Ganti pengecekan token dengan kode yang lebih informatif ini:
    // Ambil token dari environment
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || process.env.NEXT_PUBLIC_GOOGLE_REFRESH_TOKEN;

    if (!refreshToken) {
      console.error("Error: GOOGLE_REFRESH_TOKEN tidak ditemukan di process.env");
      return NextResponse.json(
        { 
          success: false, 
          error: 'GOOGLE_REFRESH_TOKEN belum terpasang di Vercel Environment Variables.' 
        },
        { status: 500 }
      );
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 3. Konversi file gambar ke Stream
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { Readable } = await import('stream');
    const stream = Readable.from(buffer);

    // 4. Tentukan target folder jika ID murni berhasil diekstrak
    const targetFolder = cleanFolderId ? [cleanFolderId] : [];

    // 5. Upload File ke Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name || `photo-${Date.now()}.jpg`,
        mimeType: file.type || 'image/jpeg',
        parents: targetFolder,
      },
      media: {
        mimeType: file.type || 'image/jpeg',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    // 6. Simpan Metadata Foto ke Tabel `photos` Supabase
    await supabaseAdmin.from('photos').insert([
      {
        event_id: eventData.id,
        drive_file_id: driveResponse.data.id,
        drive_url: driveResponse.data.webViewLink,
      },
    ]);

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
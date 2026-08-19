import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code missing' },
      { status: 400 }
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google-client/callback`
    );

    // 1. Tukar Code dengan Tokens dari Google
    const { tokens } = await oauth2Client.getToken(code);

    // =========================================================
    // LOG REFRESH TOKEN KE TERMINAL
    // =========================================================
    console.log('====================================================');
    console.log('=== REFRESH TOKEN KAMU ===:', tokens.refresh_token);
    console.log('====================================================');

    // 2. Target Tenant ID
    const tenantId = '00000000-0000-0000-0000-000000000000';

    // 3. Simpan Refresh Token ke Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    if (tokens.refresh_token) {
      const { error: updateError } = await supabaseAdmin
        .from('tenants')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('id', tenantId);

      if (updateError) {
        console.error('Gagal update ke Supabase:', updateError);
      } else {
        console.log('BERHASIL! Refresh token tersimpan ke Supabase.');
      }
    } else {
      console.warn(
        'PERHATIAN: Google tidak mengirimkan refresh_token. Pastikan prompt: "consent" telah diaktifkan di URL Auth.'
      );
    }

    // Redirect kembali ke halaman admin/settings setelah sukses
    return NextResponse.redirect(
      new URL('/dashboard/settings?status=connected', request.url)
    );
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat otorisasi Google' },
      { status: 500 }
    );
  }
}
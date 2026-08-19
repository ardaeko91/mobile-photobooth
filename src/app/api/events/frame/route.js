import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const eventId = formData.get('eventId');

    if (!file || !eventId) {
      return NextResponse.json(
        { error: 'File PNG frame dan eventId wajib diisi.' },
        { status: 400 }
      );
    }

    // Upload file ke Supabase Storage (Bucket: event-frames)
    const fileExt = file.name.split('.').pop();
    const fileName = `frame_${eventId}_${Date.now()}.${fileExt}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data: storageData, error: storageErr } = await supabaseAdmin.storage
      .from('event-frames')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    let publicUrl = '';

    if (storageErr) {
      // Fallback jika storage bucket belum disetup: simpan sebagai base64 Data URL
      const base64 = buffer.toString('base64');
      publicUrl = `data:${file.type || 'image/png'};base64,${base64}`;
    } else {
      const { data: urlData } = supabaseAdmin.storage
        .from('event-frames')
        .getPublicUrl(fileName);
      publicUrl = urlData.publicUrl;
    }

    // Update kolom frame_url di tabel events
    const { error: updateErr } = await supabaseAdmin
      .from('events')
      .update({ frame_url: publicUrl })
      .eq('id', eventId);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      frameUrl: publicUrl,
    });
  } catch (error) {
    console.error('Upload Frame Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengunggah frame.' },
      { status: 500 }
    );
  }
}

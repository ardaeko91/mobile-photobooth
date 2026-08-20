import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const slug = searchParams.get('slug');

    // Wajib ada minimal salah satu parameter: eventId atau slug
    if (!eventId && !slug) {
      return NextResponse.json({ error: 'eventId atau slug wajib diisi.' }, { status: 400 });
    }

    // Query event berdasarkan eventId jika ada, atau berdasarkan slug jika eventId tidak ada
    let query = supabaseAdmin.from('events').select('*');
    if (eventId) {
      query = query.eq('id', eventId);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: event, error: eventErr } = await query.single();

    if (eventErr || !event) {
      return NextResponse.json({ error: 'Event tidak ditemukan.' }, { status: 404 });
    }

    // Ambil galeri foto terkait berdasarkan event.id yang sudah ditemukan
    const { data: photos, error: photoErr } = await supabaseAdmin
      .from('photos')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: false });

    if (photoErr) throw photoErr;

    return NextResponse.json({ success: true, event, photos });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
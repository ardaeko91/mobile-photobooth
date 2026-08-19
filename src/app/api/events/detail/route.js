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

    if (!eventId) {
      return NextResponse.json({ error: 'eventId wajib diisi.' }, { status: 400 });
    }

    const { data: event, error: eventErr } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventErr) throw eventErr;

    const { data: photos, error: photoErr } = await supabaseAdmin
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (photoErr) throw photoErr;

    return NextResponse.json({ success: true, event, photos });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET: Fetch daftar event
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    let query = supabase.from('events').select('*').order('created_at', { ascending: false });
    if (tenantId) query = query.eq('tenant_id', tenantId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, events: data });
  } catch (err) {
    console.error('API GET Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Tambah event
export async function POST(req) {
  try {
    const { tenantId, title, slug } = await req.json();

    const { data, error } = await supabase
      .from('events')
      .insert([{ tenant_id: tenantId, title, slug, is_active: true }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, event: data });
  } catch (err) {
    console.error('API POST Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Toggle Online / Offline Status
export async function PATCH(req) {
  try {
    const { eventId, is_active } = await req.json();

    const { data, error } = await supabase
      .from('events')
      .update({ is_active })
      .eq('id', eventId)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, event: data });
  } catch (err) {
    console.error('API PATCH Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus Event Permanen
export async function DELETE(req) {
  try {
    const { eventId } = await req.json();

    // 1. Hapus foto-foto terkait event
    await supabase.from('photos').delete().eq('event_id', eventId);

    // 2. Hapus data event
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Event berhasil dihapus' });
  } catch (err) {
    console.error('API DELETE Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

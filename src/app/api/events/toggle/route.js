import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

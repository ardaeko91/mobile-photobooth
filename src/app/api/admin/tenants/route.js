import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';

export async function PATCH(req) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json({ success: false, error: 'Payload JSON tidak valid' }, { status: 400 });
    }

    const { tenantId, action, durationMonths } = body;

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID wajib diisi' }, { status: 400 });
    }

    const supabase = createClient();
    let updateData = {};

    if (action === 'activate') {
      const now = new Date();
      const months = durationMonths || 1;
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + parseInt(months));

      updateData = {
        status: 'active',
        subscription_start: now.toISOString(),
        subscription_end: endDate.toISOString(),
      };
    } else if (action === 'suspend') {
      updateData = { status: 'suspended' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', tenantId)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tenant: data?.[0] || null });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

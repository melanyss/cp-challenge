// Path: src\app\api\monitor\route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/types';

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await supabase
      .from('calls')
      .select('id')
      .eq('status', 'started')
      .lt('started', twoHoursAgo);

    if (error) {
      console.error('Error fetching failed calls:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ failedCalls: data.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling /monitor:', (error as Error).message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

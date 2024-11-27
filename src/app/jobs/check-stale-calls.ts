// Path: src\app\jobs\check-stale-calls.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkStaleCalls() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  console.log(
    `[${new Date().toISOString()}] Checking for calls started before ${oneHourAgo}`
  );

  const { data, error } = await supabase
    .from('calls')
    .select('id, started')
    .eq('status', 'started')
    .gte('started', twoHoursAgo) // Must have started within last 2 hours
    .lte('started', oneHourAgo);

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error fetching stale calls:`,
      error
    );
    return 0;
  }

  console.log(`[${new Date().toISOString()}] Found ${data.length} stale calls`);
  let updatedCount = 0;

  for (const call of data) {
    const { error: updateError } = await supabase
      .from('calls')
      .update({
        status: 'ended',
        ended: new Date().toISOString(),
        duration: Math.floor(
          (Date.now() - new Date(call.started).getTime()) / 1000
        ),
      })
      .eq('id', call.id);

    if (updateError) {
      console.error(
        `[${new Date().toISOString()}] Error updating stale call ${call.id}:`,
        updateError
      );
    } else {
      updatedCount++;
    }
  }

  console.log(
    `[${new Date().toISOString()}] Successfully updated ${updatedCount} calls`
  );
  return updatedCount;
}

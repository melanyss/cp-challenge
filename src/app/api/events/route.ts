// Path: src\app\api\events\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/types';
import { formatDuration } from '@/utils/formatDuration';
import { parseISO, isValid } from 'date-fns';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { call_id, from, to, started, ended, type } = await req.json();
  const MAX_DURATION = 3600;
  console.log('Received payload:', { call_id, from, to, started, ended, type });

  try {
    if (type === 'call_started') {
      if (!call_id || !from || !to) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      const { error } = await supabase.from('calls').insert({
        id: call_id,
        from_number: from,
        to_number: to,
        started: started || new Date().toISOString(),
        status: 'started',
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return NextResponse.json(
        { message: 'Call started event logged' },
        { status: 201 }
      );
    } else if (type === 'call_ended') {
      const { data: callData, error: fetchError } = await supabase
        .from('calls')
        .select('started')
        .eq('id', call_id)
        .single();

      if (fetchError || !callData) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }

      console.log('Supabase data fetched:', {
        callData,
        startTimeRaw: callData.started,
        startTimeParsed: new Date(`${callData.started}Z`).toISOString(),
      });

      const startTime = new Date(`${callData.started}Z`);
      const endTime = new Date(ended);
      const durationInSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      console.log('Debug: Parsed timestamps and duration', {
        startTimeUTC: startTime.toISOString(),
        endTimeUTC: endTime.toISOString(),
        durationInSeconds,
      });

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }

      if (!isValid(parseISO(callData.started)) || !isValid(parseISO(ended))) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }

      console.log('Duration calculation:', {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        durationInSeconds,
      });

      if (durationInSeconds < 0) {
        return NextResponse.json(
          {
            error:
              'Invalid call duration. End time cannot be before start time.',
          },
          { status: 400 }
        );
      }

      if (durationInSeconds > MAX_DURATION) {
        console.error('Duration exceeds maximum allowed:', {
          durationInSeconds,
          maxDuration: MAX_DURATION,
          startTime: callData.started,
          endTime: endTime.toISOString(),
          parsedStartTime: startTime.toISOString(),
          parsedEndTime: endTime.toISOString(),
        });
        return NextResponse.json(
          {
            error: 'Invalid call duration. Calls cannot exceed 1 hour.',
            duration: formatDuration(durationInSeconds),
          },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from('calls')
        .update({
          ended: endTime.toISOString(), // Convert back to string
          duration: durationInSeconds,
          status: 'ended',
        })
        .eq('id', call_id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0)
        return NextResponse.json(
          { error: 'Failed to update call' },
          { status: 500 }
        );
      return NextResponse.json(
        {
          message: 'Call ended event logged',
          duration: formatDuration(durationInSeconds),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid type provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in /events POST handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

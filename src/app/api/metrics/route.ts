// Path: src\app\api\metrics\route.ts
import { NextResponse } from 'next/server';
import type { Database } from '@/types/types';
import { withRetry } from '@/lib/retry';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface MetricsResponse {
  totalCalls: number;
  failedCalls: number;
  pendingCalls: number;
  averageDuration: number;
  maxDuration: number;
  minDuration: number;
  errorRate: number;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics = await withRetry<MetricsResponse>(async () => {
      const [totalResult, failedResult, pendingResult, durationsResult] =
        await Promise.all([
          supabase.from('calls').select('*', { count: 'exact', head: true }),
          supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'failed'),
          supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'started'),
          supabase.from('calls').select('duration').not('duration', 'is', null),
        ]);

      if (!totalResult || !failedResult || !pendingResult || !durationsResult) {
        console.error('Database query errors:', {
          totalError: totalResult?.error,
          failedError: failedResult?.error,
          pendingError: pendingResult?.error,
          durationsError: durationsResult?.error,
        });
        throw new Error('Failed to fetch complete metrics data');
      }
      interface DurationData {
        duration: number | null;
      }

      const validDurations = ((durationsResult.data as DurationData[]) || [])
        .map((d) => d.duration)
        .filter((d): d is number => typeof d === 'number');

      const totalCount = totalResult.count || 0;
      const failedCount = failedResult.count || 0;
      const pendingCount = pendingResult.count || 0;

      return {
        totalCalls: totalCount,
        failedCalls: failedCount,
        pendingCalls: pendingCount,
        errorRate: totalCount > 0 ? (failedCount / totalCount) * 100 : 0,
        averageDuration:
          validDurations.length > 0
            ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length
            : 0,
        maxDuration:
          validDurations.length > 0 ? Math.max(...validDurations) : 0,
        minDuration:
          validDurations.length > 0 ? Math.min(...validDurations) : 0,
      };
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch metrics',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Path: src\app\api\cron\route.ts
import { NextResponse } from 'next/server';
import { checkStaleCalls } from '@/app/jobs/check-stale-calls';

export async function GET() {
  console.log(
    `[${new Date().toISOString()}] Cron job started: Checking for stale calls`
  );
  try {
    const updatedCalls = await checkStaleCalls();
    console.log(
      `[${new Date().toISOString()}] Cron job completed: Updated ${updatedCalls} stale calls`
    );
    return NextResponse.json({ success: true, updatedCalls });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron job error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

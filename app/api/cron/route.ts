import { NextResponse } from 'next/server';
import { runDueJobs } from '@/lib/jobs';

// GET /api/cron?secret=CRON_SECRET — run all due jobs now.
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const report = await runDueJobs({ force: true });
  return NextResponse.json({ ok: true, report });
}

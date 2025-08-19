import { NextResponse } from 'next/server';
import { ensureSocketIOServerStarted } from '@/infrastructure/realtime/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  ensureSocketIOServerStarted();
  return new NextResponse(null, { status: 200 });
}



import { NextResponse } from 'next/server';
import { ok, serverError } from '@/lib/responses';
import { prisma } from '@/infrastructure/prisma';
import { EventRepositoryPrisma } from '@/infrastructure/repositories/prisma/EventRepositoryPrisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repo = new EventRepositoryPrisma(prisma);
    const events = await repo.listAll();
    return NextResponse.json(ok(events));
  } catch (error) {
    return NextResponse.json(serverError('Failed to list events'), { status: 500 });
  }
}



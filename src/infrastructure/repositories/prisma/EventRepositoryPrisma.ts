import { PrismaClient } from '@prisma/client';
import type { EventListItem, EventRepository } from '@/application/ports/EventRepository';

export class EventRepositoryPrisma implements EventRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAll(): Promise<EventListItem[]> {
    const rows = await this.prisma.event.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => ({ id: r.id, name: r.name }));
  }

  async getNameById(eventId: string): Promise<string | null> {
    const row = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { name: true },
    });
    return row?.name ?? null;
  }
}

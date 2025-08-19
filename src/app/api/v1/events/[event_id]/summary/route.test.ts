import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

function jsonResponseBody(res: NextResponse) {
	return (res as unknown as Response).json();
}

describe('api/v1/events/[event_id]/summary route', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it('returns 404 when feature flag disabled', async () => {
		const original = process.env.FEATURE_SUMMARIES;
		process.env.FEATURE_SUMMARIES = 'false';
		const { GET } = await import('./route');
		const res = (await GET(new Request('http://localhost'), { params: { event_id: 'e1' } })) as NextResponse;
		expect(res.status).toBe(404);
		const body = await jsonResponseBody(res);
		expect(body.error.code).toBe(404);
		process.env.FEATURE_SUMMARIES = original;
	});

	it('returns 404 when event not found', async () => {
		process.env.FEATURE_SUMMARIES = 'true';
		const { GET } = await import('./route');
		const { EventRepositoryPrisma } = await import('@/infrastructure/repositories/prisma/EventRepositoryPrisma');
		vi.spyOn(EventRepositoryPrisma.prototype, 'getNameById').mockResolvedValueOnce(null);
		const res = (await GET(new Request('http://localhost'), { params: { event_id: 'missing' } })) as NextResponse;
		expect(res.status).toBe(404);
		const body = await jsonResponseBody(res);
		expect(body.error.code).toBe(404);
	});

	it('returns summary payload when enabled and event exists', async () => {
		process.env.FEATURE_SUMMARIES = 'true';
		const { GET } = await import('./route');
		const { EventRepositoryPrisma } = await import('@/infrastructure/repositories/prisma/EventRepositoryPrisma');
		const { OpenAISummaryService } = await import('@/infrastructure/ai/openaiSummaryService');

		vi.spyOn(EventRepositoryPrisma.prototype, 'getNameById').mockResolvedValueOnce('Event X');
		vi.spyOn(OpenAISummaryService.prototype, 'computeSummaryForEvent').mockResolvedValueOnce({
			positive_percentage: 82,
			top_highlights: ['Great talks'],
			areas_for_improvement: ['More seating'],
		});

		const res = (await GET(new Request('http://localhost'), { params: { event_id: 'e1' } })) as NextResponse;
		expect(res.status).toBe(200);
		const body = await jsonResponseBody(res);
		expect(body.data).toMatchObject({ event_id: 'e1', summary: { positive_percentage: 82 } });
	});

	it('returns 500 on server error', async () => {
		process.env.FEATURE_SUMMARIES = 'true';
		const { GET } = await import('./route');
		const { OpenAISummaryService } = await import('@/infrastructure/ai/openaiSummaryService');

		vi.spyOn(OpenAISummaryService.prototype, 'computeSummaryForEvent').mockRejectedValueOnce(new Error('boom'));
		const res = (await GET(new Request('http://localhost'), { params: { event_id: 'e1' } })) as NextResponse;
		expect(res.status).toBe(500);
		const body = await jsonResponseBody(res);
		expect(body.error.code).toBe(500);
	});
});



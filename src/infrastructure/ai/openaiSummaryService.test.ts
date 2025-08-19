import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAISummaryService } from './openaiSummaryService';

const prismaMock = {
	feedback: {
		findMany: vi.fn(),
	},
} as any;

describe('OpenAISummaryService', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it('returns heuristic fallback when no API key', async () => {
		prismaMock.feedback.findMany.mockResolvedValueOnce([{ text: 'Great event', rating: 5 }]);
		const svc = new OpenAISummaryService(prismaMock, { apiKey: undefined });
		const s = await svc.computeSummaryForEvent('e1');
		expect(typeof s.positive_percentage).toBe('number');
	});

	it('calls chat client when api key provided and parses JSON', async () => {
		prismaMock.feedback.findMany.mockResolvedValueOnce([{ text: 'Great event', rating: 5 }]);
		const svc = new OpenAISummaryService(prismaMock, { apiKey: 'k' });
		const spy = vi
			.spyOn(await import('./openaiClient').then((m) => m.OpenAIChatClient.prototype), 'complete')
			.mockResolvedValueOnce(JSON.stringify({ positive_percentage: 80, top_highlights: ['Great talks'], areas_for_improvement: ['Lines'] }));
		const s = await svc.computeSummaryForEvent('e1');
		expect(s.positive_percentage).toBe(80);
		expect(spy).toHaveBeenCalled();
	});
});



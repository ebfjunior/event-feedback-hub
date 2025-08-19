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

  it('returns fallback when no API key', async () => {
    prismaMock.feedback.findMany.mockResolvedValueOnce([{ text: 'Great event' }]);
    const svc = new OpenAISummaryService(prismaMock, { apiKey: undefined });
    const s = await svc.computeSummaryForEvent('e1');
    expect(s).toMatch(/Summary \(fallback\)/);
  });

  it('calls chat client when api key provided', async () => {
    prismaMock.feedback.findMany.mockResolvedValueOnce([{ text: 'Great event' }]);
    const svc = new OpenAISummaryService(prismaMock, { apiKey: 'k' });
    const spy = vi
      .spyOn(await import('./openaiClient').then((m) => m.OpenAIChatClient.prototype), 'complete')
      .mockResolvedValueOnce('ok');
    const s = await svc.computeSummaryForEvent('e1');
    expect(s).toBe('ok');
    expect(spy).toHaveBeenCalled();
  });
});



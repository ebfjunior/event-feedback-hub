import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIChatClient } from './openaiClient';

describe('OpenAIChatClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('returns content from API response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hello' } }] }),
    }) as unknown as typeof fetch;
    const client = new OpenAIChatClient('key');
    const content = await client.complete({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] });
    expect(content).toBe('Hello');
  });

  it('throws on non-ok response', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized', text: async () => 'nope' }) as unknown as typeof fetch;
    const client = new OpenAIChatClient('key');
    await expect(
      client.complete({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] }),
    ).rejects.toThrow(/OpenAI API error/);
  });

  it('throws when content missing', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{}] }) }) as unknown as typeof fetch;
    const client = new OpenAIChatClient('key');
    await expect(
      client.complete({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] }),
    ).rejects.toThrow(/missing content/);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
});



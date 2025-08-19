import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIChatClient } from './openaiClient';

describe('OpenAIChatClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('returns content from API response', async () => {
    // @ts-expect-error allow mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Hello' } }] }),
    });
    const client = new OpenAIChatClient('key');
    const content = await client.complete({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] });
    expect(content).toBe('Hello');
  });

  it('throws on non-ok response', async () => {
    // @ts-expect-error allow mock
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized', text: async () => 'nope' });
    const client = new OpenAIChatClient('key');
    await expect(
      client.complete({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] }),
    ).rejects.toThrow(/OpenAI API error/);
  });

  it('throws when content missing', async () => {
    // @ts-expect-error allow mock
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{}] }) });
    const client = new OpenAIChatClient('key');
    await expect(
      client.complete({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ping' }] }),
    ).rejects.toThrow(/missing content/);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
});



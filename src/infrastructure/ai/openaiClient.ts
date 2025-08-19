export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface ChatClient {
  complete(params: {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    timeoutMs?: number;
  }): Promise<string>;
}

export class OpenAIChatClient implements ChatClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(params: {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    timeoutMs?: number;
  }): Promise<string> {
    const { model, messages, temperature = 0.2, timeoutMs = 15000 } = params;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${text}`);
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('OpenAI response missing content');
      }
      return content;
    } finally {
      clearTimeout(id);
    }
  }
}



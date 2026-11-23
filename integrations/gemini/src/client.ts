/**
 * Google Gemini API Client with Structured Generation, Retries & Cost Tracking
 */

export interface GeminiClientConfig {
  apiKey?: string;
  defaultModel?: string;
  freeOnlyMode?: boolean;
}

export interface GenerationUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export class GeminiClient {
  private apiKey: string;
  private defaultModel: string;
  private freeOnlyMode: boolean;

  constructor(config: GeminiClientConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = config.defaultModel || 'gemini-2.5-flash';
    this.freeOnlyMode = config.freeOnlyMode ?? true;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  private cleanJson(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean;
  }

  /**
   * Execute structured completion via Gemini REST API
   */
  public async generateStructured<T>(prompt: string, modelOverride?: string): Promise<{ data: T; usage: GenerationUsage }> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please set the key in user settings or environment.');
    }

    const model = modelOverride || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    };

    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API error (Status ${response.status}): ${errText}`);
        }

        const resData = await response.json();
        const candidateText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          throw new Error('No candidate content received from Gemini API');
        }

        const usageMetadata = resData.usageMetadata || {};
        const usage: GenerationUsage = {
          promptTokens: usageMetadata.promptTokenCount || 0,
          completionTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
          model
        };

        const cleaned = this.cleanJson(candidateText);
        const parsed = JSON.parse(cleaned) as T;

        return { data: parsed, usage };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 500;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }

    throw lastError || new Error('Failed to generate structured response from Gemini after retries');
  }
}

export const defaultGeminiClient = new GeminiClient();

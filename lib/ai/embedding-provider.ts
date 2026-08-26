import OpenAI from "openai";

// ─── Embedding Provider Interface ─────────────────────────────────────────────

export interface EmbeddingProvider {
  embedText(text: string): Promise<number[]>;
  embedTexts(texts: string[]): Promise<number[][]>;
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

const embeddingCache = new Map<string, number[]>();

// ─── OpenAI Embedding Provider ────────────────────────────────────────────────

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

const MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

export const openAIEmbeddingProvider: EmbeddingProvider = {
  async embedText(text: string): Promise<number[]> {
    const cached = embeddingCache.get(text);
    if (cached) return cached;

    const client = getOpenAIClient();
    const response = await client.embeddings.create({
      model: MODEL,
      input: text.slice(0, 8000), // limit to avoid token overflow
    });

    const embedding = response.data[0].embedding;
    embeddingCache.set(text, embedding);
    return embedding;
  },

  async embedTexts(texts: string[]): Promise<number[][]> {
    // Split into batches of 100
    const BATCH_SIZE = 100;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      // Check cache first
      const uncachedIndices: number[] = [];
      const batchResults: (number[] | null)[] = batch.map((text, idx) => {
        const cached = embeddingCache.get(text);
        if (cached) return cached;
        uncachedIndices.push(idx);
        return null;
      });

      if (uncachedIndices.length > 0) {
        const client = getOpenAIClient();
        const uncachedTexts = uncachedIndices.map((idx) => batch[idx].slice(0, 8000));
        const response = await client.embeddings.create({
          model: MODEL,
          input: uncachedTexts,
        });

        response.data.forEach((item, responseIdx) => {
          const batchIdx = uncachedIndices[responseIdx];
          batchResults[batchIdx] = item.embedding;
          embeddingCache.set(batch[batchIdx], item.embedding);
        });
      }

      results.push(...(batchResults.filter(Boolean) as number[][]));
    }

    return results;
  },
};

// ─── Mock Embedding Provider (for when API key is not available) ──────────────

function simpleHash(text: string): number[] {
  // Deterministic pseudo-embedding based on word frequencies
  // NOT suitable for production but allows demo mode without API key
  const words = text.toLowerCase().split(/\s+/);
  const dim = 256;
  const vec = new Array(dim).fill(0);

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) * (i + 1) * 31) % dim;
      vec[idx] += 1;
    }
  }

  // Normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export const mockEmbeddingProvider: EmbeddingProvider = {
  async embedText(text: string): Promise<number[]> {
    return simpleHash(text);
  },
  async embedTexts(texts: string[]): Promise<number[][]> {
    return texts.map(simpleHash);
  },
};

// ─── Factory ──────────────────────────────────────────────────────────────────

export function getEmbeddingProvider(isDemo = false): EmbeddingProvider {
  if (isDemo || !process.env.OPENAI_API_KEY) {
    return mockEmbeddingProvider;
  }
  return openAIEmbeddingProvider;
}

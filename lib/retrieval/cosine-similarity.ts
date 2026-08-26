/**
 * Cosine similarity between two vectors.
 * Returns a value between -1 (opposite) and 1 (identical).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dot / denominator;
}

export interface ScoredCandidate {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * In-memory vector index entry
 */
export interface VectorEntry {
  id: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

/**
 * Simple in-memory vector index.
 * Pluggable — can be replaced with pgvector, Qdrant, Pinecone, etc.
 */
export class InMemoryVectorIndex {
  private entries: VectorEntry[] = [];

  add(entry: VectorEntry): void {
    this.entries.push(entry);
  }

  addMany(entries: VectorEntry[]): void {
    this.entries.push(...entries);
  }

  clear(): void {
    this.entries = [];
  }

  /**
   * Return top-k most similar entries to the query embedding.
   */
  topK(queryEmbedding: number[], k: number): ScoredCandidate[] {
    const scored = this.entries.map((entry) => ({
      id: entry.id,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
      metadata: entry.metadata,
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }
}

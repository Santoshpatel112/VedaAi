import type { Question, StudentAnswer } from "@/lib/types";
import type { EmbeddingProvider } from "@/lib/ai/embedding-provider";
import { InMemoryVectorIndex, type ScoredCandidate } from "./cosine-similarity";

/**
 * SemanticSearchService
 * Embeds all questions and answers, then provides semantic retrieval.
 */
export class SemanticSearchService {
  private questionIndex = new InMemoryVectorIndex();
  private answerIndex = new InMemoryVectorIndex();
  private initialized = false;

  constructor(private embeddingProvider: EmbeddingProvider) {}

  async initialize(
    questions: Question[],
    answers: StudentAnswer[]
  ): Promise<void> {
    this.questionIndex.clear();
    this.answerIndex.clear();

    // Embed questions
    const questionTexts = questions.map((q) => `${q.number}: ${q.text}`);
    const questionEmbeddings = await this.embeddingProvider.embedTexts(questionTexts);

    questions.forEach((q, i) => {
      this.questionIndex.add({
        id: q.id,
        embedding: questionEmbeddings[i],
        metadata: { number: q.normalizedNumber, text: q.text },
      });
    });

    // Embed answers
    const answerTexts = answers.map((a) => a.text);
    const answerEmbeddings = await this.embeddingProvider.embedTexts(answerTexts);

    answers.forEach((a, i) => {
      this.answerIndex.add({
        id: a.id,
        embedding: answerEmbeddings[i],
        metadata: { number: a.normalizedNumber, text: a.text },
      });
    });

    this.initialized = true;
  }

  /**
   * Given a question, find the top-k semantically similar answers.
   */
  async findAnswersForQuestion(
    question: Question,
    k = 3
  ): Promise<ScoredCandidate[]> {
    if (!this.initialized) throw new Error("SemanticSearchService not initialized");

    const queryText = `${question.number}: ${question.text}`;
    const queryEmbedding = await this.embeddingProvider.embedText(queryText);

    return this.answerIndex.topK(queryEmbedding, k);
  }

  /**
   * Given an answer, find the top-k semantically similar questions.
   */
  async findQuestionsForAnswer(
    answer: StudentAnswer,
    k = 3
  ): Promise<ScoredCandidate[]> {
    if (!this.initialized) throw new Error("SemanticSearchService not initialized");

    const queryEmbedding = await this.embeddingProvider.embedText(answer.text);
    return this.questionIndex.topK(queryEmbedding, k);
  }
}

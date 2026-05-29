import { ExampleSentence } from '../../types';
import {
  QualityAssessor,
  DiversityMetrics,
  NaturalnessMetrics,
} from './types';

/**
 * Implementation of QualityAssessor for evaluating example sentence quality
 * Validates: Requirements 2.3, 2.4, 2.5, 2.6, 9.1, 9.2
 */
export class QualityAssessorImpl implements QualityAssessor {
  /**
   * Assess quality of a collection of examples
   * Calculates both diversity (across all examples) and naturalness (per example)
   *
   * @param examples - Array of example sentences to assess
   * @returns Promise resolving to examples with quality scores attached
   */
  async assessExamples<T extends ExampleSentence>(examples: T[]): Promise<T[]> {
    // Calculate diversity score for the entire set
    const diversityMetrics = this.calculateDiversityScore(examples);

    // Calculate naturalness score for each example
    const assessed = await Promise.all(
      examples.map(async (example) => {
        const naturalnessMetrics =
          await this.calculateNaturalnessScore(example);

        return {
          ...example,
          diversityScore: diversityMetrics.overallScore,
          naturalnessScore: naturalnessMetrics.overallScore,
        } as T;
      })
    );

    return assessed;
  }

  /**
   * Calculate diversity score for a set of examples
   * Measures variety in structure, length, and vocabulary
   * **Validates: Requirements 2.3, 2.4, 2.6, 9.1, 9.2**
   *
   * @param examples - Array of example sentences
   * @returns Diversity metrics including overall score
   */
  calculateDiversityScore(examples: ExampleSentence[]): DiversityMetrics {
    if (examples.length === 0) {
      return {
        sentenceLengthVariance: 0,
        structuralDiversity: 0,
        vocabularyRichness: 0,
        overallScore: 0,
      };
    }

    // 1. Sentence Length Variance
    // Calculate variance in sentence lengths and normalize to 0-1
    const lengths = examples.map((ex) => ex.sentence.split(/\s+/).length);
    const avgLength =
      lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) /
      lengths.length;
    // Normalize variance to 0-1 scale (assuming max reasonable variance is 20)
    const sentenceLengthVariance = Math.min(variance / 20, 1);

    // 2. Structural Diversity (based on unique sentence beginnings)
    // Extract first 3 words from each sentence to identify unique beginnings
    const beginnings = examples.map((ex) =>
      ex.sentence.split(/\s+/).slice(0, 3).join(' ').toLowerCase()
    );
    const uniqueBeginnings = new Set(beginnings).size;
    // Ratio of unique beginnings to total sentences
    const structuralDiversity = uniqueBeginnings / examples.length;

    // 3. Vocabulary Richness (unique words / total words)
    // Collect all words from all sentences (filter out short words < 4 chars)
    const allWords = examples.flatMap((ex) =>
      ex.sentence
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
    const uniqueWords = new Set(allWords).size;
    const vocabularyRichness =
      allWords.length > 0 ? uniqueWords / allWords.length : 0;

    // Overall diversity score (weighted average)
    // Weights: length variance 30%, structural diversity 40%, vocabulary richness 30%
    const overallScore =
      sentenceLengthVariance * 0.3 +
      structuralDiversity * 0.4 +
      vocabularyRichness * 0.3;

    return {
      sentenceLengthVariance,
      structuralDiversity,
      vocabularyRichness,
      overallScore,
    };
  }

  /**
   * Calculate naturalness score for a single example
   * Measures grammar, idiomaticness, and context appropriateness
   * **Validates: Requirements 2.5, 9.1, 9.2**
   *
   * @param example - Single example sentence to assess
   * @returns Promise resolving to naturalness metrics including overall score
   */
  async calculateNaturalnessScore(
    example: ExampleSentence
  ): Promise<NaturalnessMetrics> {
    // Use heuristic-based scoring for performance
    // In production, could optionally use AI for more accurate assessment

    // 1. Grammar Correctness (basic heuristics)
    const grammarCorrectness = this.assessGrammar(example.sentence);

    // 2. Idiomatic Expression (check for common patterns)
    const idiomaticExpression = this.assessIdiomaticness(example.sentence);

    // 3. Context Appropriateness (check word usage)
    const contextAppropriate = this.assessContextAppropriate(example);

    // Overall naturalness score (weighted average)
    // Weights: grammar 40%, idiomatic 30%, context 30%
    const overallScore =
      grammarCorrectness * 0.4 +
      idiomaticExpression * 0.3 +
      contextAppropriate * 0.3;

    return {
      grammarCorrectness,
      idiomaticExpression,
      contextAppropriate,
      overallScore,
    };
  }

  /**
   * Assess grammar correctness using basic heuristics
   * Checks capitalization, punctuation, spacing, and basic structure
   *
   * @param sentence - Sentence to assess
   * @returns Grammar score (0-1)
   */
  private assessGrammar(sentence: string): number {
    let score = 1.0;

    // Check capitalization (should start with capital letter)
    if (!/^[A-Z]/.test(sentence)) score -= 0.2;

    // Check ending punctuation (should end with . ! or ?)
    if (!/[.!?]$/.test(sentence)) score -= 0.2;

    // Check for double spaces (should not have multiple consecutive spaces)
    if (/\s{2,}/.test(sentence)) score -= 0.1;

    // Check for basic subject-verb patterns
    const hasBasicStructure =
      /\b(I|you|he|she|it|we|they|the|a|an)\s+\w+/.test(
        sentence.toLowerCase()
      );
    if (!hasBasicStructure) score -= 0.2;

    return Math.max(score, 0);
  }

  /**
   * Assess idiomaticness and naturalness of expression
   * Checks for template-like patterns and natural language features
   *
   * @param sentence - Sentence to assess
   * @returns Idiomatic score (0-1)
   */
  private assessIdiomaticness(sentence: string): number {
    // Check for template-like patterns (negative indicators)
    const templatePatterns = [
      /^I \w+ every day\.$/,
      /^She likes to \w+\.$/,
      /^The \w+ is \w+\.$/,
      /^We need to \w+ more\.$/,
    ];

    const isTemplate = templatePatterns.some((pattern) =>
      pattern.test(sentence)
    );
    if (isTemplate) return 0.3;

    // Check for natural connectors and transitions
    const naturalConnectors = [
      'however',
      'therefore',
      'moreover',
      'although',
      'because',
      'while',
      'since',
    ];
    const hasConnectors = naturalConnectors.some((conn) =>
      sentence.toLowerCase().includes(conn)
    );

    // Check for varied sentence structure
    const hasComma = sentence.includes(',');
    const hasConjunction = /\b(and|but|or|so|yet)\b/.test(
      sentence.toLowerCase()
    );

    let score = 0.7; // Base score
    if (hasConnectors) score += 0.1;
    if (hasComma) score += 0.1;
    if (hasConjunction) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Assess context appropriateness of word usage
   * Checks if the highlight word is used correctly in the sentence
   *
   * @param example - Example sentence to assess
   * @returns Context appropriateness score (0-1)
   */
  private assessContextAppropriate(example: ExampleSentence): number {
    const sentence = example.sentence.toLowerCase();
    const word = example.highlightWord.toLowerCase();

    // Word should appear in sentence
    if (!sentence.includes(word)) return 0;

    // Check word boundaries (not part of another word)
    const wordRegex = new RegExp(`\\b${word}\\b`);
    if (!wordRegex.test(sentence)) return 0.5;

    // Check sentence length is appropriate (8-20 words)
    const wordCount = example.sentence.split(/\s+/).length;
    if (wordCount < 8 || wordCount > 20) return 0.7;

    // All checks passed
    return 1.0;
  }
}

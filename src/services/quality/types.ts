import { ExampleSentence } from '../../types';

/**
 * Metrics for assessing diversity of example sentences
 * Validates: Requirements 2.3, 2.4
 */
export interface DiversityMetrics {
  /** Variance in sentence lengths (0-1, normalized) */
  sentenceLengthVariance: number;
  /** Diversity in sentence structures and beginnings (0-1) */
  structuralDiversity: number;
  /** Richness of vocabulary used (unique words / total words) */
  vocabularyRichness: number;
  /** Overall diversity score (weighted average of above metrics) */
  overallScore: number;
}

/**
 * Metrics for assessing naturalness of example sentences
 * Validates: Requirements 2.5, 9.1, 9.2
 */
export interface NaturalnessMetrics {
  /** Grammar correctness score (0-1) */
  grammarCorrectness: number;
  /** Use of idiomatic expressions and natural patterns (0-1) */
  idiomaticExpression: number;
  /** Appropriateness for the given context (0-1) */
  contextAppropriate: number;
  /** Overall naturalness score (weighted average of above metrics) */
  overallScore: number;
}

/**
 * Complete quality assessment for example sentences
 * Validates: Requirements 2.3, 2.4, 2.5, 9.1, 9.2
 */
export interface QualityAssessment {
  /** Overall diversity score for the example set */
  diversityScore: number;
  /** Overall naturalness score for the example */
  naturalnessScore: number;
  /** Detailed diversity metrics */
  diversityMetrics: DiversityMetrics;
  /** Detailed naturalness metrics */
  naturalnessMetrics: NaturalnessMetrics;
}

/**
 * Interface for assessing quality of generated example sentences
 * Validates: Requirements 2.3, 2.4, 2.5, 9.1, 9.2
 */
export interface QualityAssessor {
  /**
   * Assess quality of a collection of examples
   * Calculates both diversity (across all examples) and naturalness (per example)
   * 
   * @param examples - Array of example sentences to assess
   * @returns Promise resolving to examples with quality scores attached
   */
  assessExamples<T extends ExampleSentence>(examples: T[]): Promise<T[]>;

  /**
   * Calculate diversity score for a set of examples
   * Measures variety in structure, length, and vocabulary
   * 
   * @param examples - Array of example sentences
   * @returns Diversity metrics including overall score
   */
  calculateDiversityScore(examples: ExampleSentence[]): DiversityMetrics;

  /**
   * Calculate naturalness score for a single example
   * Measures grammar, idiomaticness, and context appropriateness
   * 
   * @param example - Single example sentence to assess
   * @returns Promise resolving to naturalness metrics including overall score
   */
  calculateNaturalnessScore(
    example: ExampleSentence
  ): Promise<NaturalnessMetrics>;
}

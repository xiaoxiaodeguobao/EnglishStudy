/**
 * Enhanced Example Sentence Service Types
 * 
 * Defines interfaces for the enhanced example sentence generation system
 * that integrates AI services, context analysis, quality assessment, and caching.
 * 
 * **Validates: Requirements 1.4, 2.3, 4.6, 9.6**
 */

import { ExampleSentence, ExampleSentenceService, Word } from '../../types';
import { SentenceChain } from '../../types/wordList';
import { ApplicationContext } from '../ai/types';

/**
 * Enhanced example sentence with context, quality scores, and metadata
 * 
 * Extends the base ExampleSentence with additional fields for:
 * - Application context (scenario type)
 * - Quality scores (diversity and naturalness)
 * - Generation metadata (timestamp, model, tokens)
 * 
 * Requirement 1.4: Label context in metadata
 * Requirement 2.3: Calculate diversity score
 * Requirement 9.6: Record quality statistics
 */
export interface EnhancedExampleSentence extends ExampleSentence {
  /** Application context/scenario for this example */
  context: ApplicationContext;
  
  /** Diversity score for the example set (0-1) */
  diversityScore?: number;
  
  /** Naturalness score for this specific example (0-1) */
  naturalnessScore?: number;
  
  /** Metadata about generation */
  metadata: {
    /** When this example was generated */
    generatedAt: Date;
    /** AI model used for generation */
    model: string;
    /** Number of tokens consumed */
    tokensUsed: number;
  };
}

/**
 * Options for generating enhanced example sentences
 * 
 * Requirement 4.1: Generate 12-15 examples per word
 * Requirement 1.3: Support multiple contexts
 * Requirement 9.3: Quality score thresholds
 */
export interface ExampleGenerationOptions {
  /** Number of examples to generate */
  count: number;
  
  /** Specific contexts to generate for (optional, will analyze if not provided) */
  contexts?: ApplicationContext[];
  
  /** Minimum quality score threshold (0-1, default 0.7) */
  minQualityScore?: number;
  
  /** Maximum retry attempts for quality failures (default 2) */
  maxRetries?: number;
}

/**
 * Result of enhanced example generation with statistics
 * 
 * Requirement 4.6: Return generation statistics
 * Requirement 9.6: Record quality assessment statistics
 */
export interface ExampleGenerationResult {
  /** Generated and quality-filtered examples */
  examples: EnhancedExampleSentence[];
  
  /** Statistics about the generation process */
  statistics: {
    /** Total number of examples generated (before filtering) */
    totalGenerated: number;
    
    /** Number of examples filtered out due to low quality */
    filtered: number;
    
    /** Average diversity score across all examples */
    averageDiversityScore: number;
    
    /** Average naturalness score across all examples */
    averageNaturalnessScore: number;
    
    /** Total generation time in milliseconds */
    generationTime: number;
  };
}

/**
 * Enhanced Example Sentence Service Interface
 * 
 * Orchestrates AI generation, context analysis, quality assessment, and caching
 * to provide high-quality, contextual example sentences.
 * 
 * Extends the base ExampleSentenceService interface for backward compatibility.
 * 
 * Requirement 1.4: Scenario-based generation
 * Requirement 2.3: Diversity scoring
 * Requirement 4.6: Quality control and statistics
 * Requirement 9.6: Quality assessment integration
 * Requirement 4.1, 4.2, 4.3, 4.4: Backward compatibility
 */
export interface EnhancedExampleSentenceService extends ExampleSentenceService {
  /**
   * Generate enhanced examples with full quality control
   * 
   * This method:
   * 1. Analyzes word contexts (if not provided)
   * 2. Generates examples for each context using AI
   * 3. Assesses quality (diversity and naturalness)
   * 4. Filters low-quality examples
   * 5. Retries if needed to meet quality thresholds
   * 
   * @param word - The word to generate examples for
   * @param options - Generation options (count, contexts, quality thresholds)
   * @returns Promise resolving to examples with generation statistics
   * 
   * Requirement 1.4: Generate examples for identified contexts
   * Requirement 2.3: Calculate and enforce diversity scores
   * Requirement 4.6: Return statistics
   * Requirement 9.6: Quality assessment and filtering
   */
  generateEnhancedExamples(
    word: string,
    options: ExampleGenerationOptions
  ): Promise<ExampleGenerationResult>;

  /**
   * Get examples from cache or generate new ones
   * 
   * This method:
   * 1. Checks cache for existing examples
   * 2. Returns cached examples if valid (< 30 days old)
   * 3. Generates new examples if cache miss or expired
   * 4. Updates cache with newly generated examples
   * 
   * @param word - The word to get examples for
   * @param count - Number of examples to return
   * @returns Promise resolving to enhanced example sentences
   * 
   * Requirement 7.2: Check cache first
   * Requirement 7.3: Return cached examples if valid
   * Requirement 7.4: Generate and cache on miss
   */
  getExamplesWithCache(
    word: string,
    count: number
  ): Promise<EnhancedExampleSentence[]>;

  // Note: getExamples() and validateExamples() are inherited from ExampleSentenceService
  // The implementation converts EnhancedExampleSentence to ExampleSentence format
  // for backward compatibility (Requirements 4.1, 4.2, 4.3, 4.4)
}

/**
 * Enhanced sentence chain with context, quality score, and metadata
 * 
 * Extends the base SentenceChain with additional fields for:
 * - Application context (scenario type)
 * - Quality score (overall quality assessment)
 * - Generation metadata (timestamp, model, tokens)
 * 
 * Requirement 5.3: Assign application context to sentence chains
 * Requirement 5.6: Ensure semantic coherence and context appropriateness
 */
export interface EnhancedSentenceChain extends SentenceChain {
  /** Application context/scenario for this sentence chain */
  context: ApplicationContext;
  
  /** Quality score for this sentence chain (0-1) */
  qualityScore: number;
  
  /** Metadata about generation */
  metadata: {
    /** When this sentence chain was generated */
    generatedAt: Date;
    /** AI model used for generation */
    model: string;
    /** Number of tokens consumed */
    tokensUsed: number;
  };
}

/**
 * Options for generating enhanced sentence chains
 * 
 * Requirement 5.1: Generate 5-8 sentence chains per word group
 * Requirement 5.2: Each chain uses 2-4 words
 * Requirement 5.4: Cover at least 3 different contexts
 */
export interface SentenceChainGenerationOptions {
  /** Number of sentence chains to generate */
  count: number;
  
  /** Minimum number of words per chain (default: 2) */
  minWords: number;
  
  /** Maximum number of words per chain (default: 4) */
  maxWords: number;
  
  /** Specific contexts to generate for (optional, will analyze if not provided) */
  contexts?: ApplicationContext[];
  
  /** Minimum quality score threshold (0-1, default 0.7) */
  minQualityScore?: number;
}

/**
 * Sentence Chain Service Interface
 * 
 * Generates multi-word sentence chains with scenario awareness,
 * quality assessment, and caching support.
 * 
 * Requirement 5.1: Generate 5-8 sentence chains
 * Requirement 5.2: Use 2-4 words per chain
 * Requirement 5.3: Assign application contexts
 * Requirement 5.4: Cover multiple contexts
 * Requirement 5.6: Ensure semantic coherence
 */
export interface SentenceChainService {
  /**
   * Generate sentence chains using multiple words
   * 
   * This method:
   * 1. Analyzes word contexts (if not provided)
   * 2. Generates sentence chains for each context using AI
   * 3. Assesses quality of generated chains
   * 4. Filters low-quality chains
   * 5. Returns top chains sorted by quality
   * 
   * @param words - Array of words to include in chains
   * @param options - Generation options (count, word limits, contexts, quality thresholds)
   * @returns Promise resolving to enhanced sentence chains
   * 
   * Requirement 5.1: Generate specified number of chains
   * Requirement 5.2: Respect min/max word constraints
   * Requirement 5.3: Generate for identified contexts
   * Requirement 5.6: Quality assessment and filtering
   */
  generateSentenceChains(
    words: Word[],
    options: SentenceChainGenerationOptions
  ): Promise<EnhancedSentenceChain[]>;

  /**
   * Get sentence chains from cache or generate new ones
   * 
   * This method:
   * 1. Creates cache key from word IDs
   * 2. Checks cache for existing chains
   * 3. Returns cached chains if valid (< 30 days old)
   * 4. Generates new chains if cache miss or expired
   * 5. Updates cache with newly generated chains
   * 
   * @param words - Array of words to include in chains
   * @param count - Number of sentence chains to return
   * @returns Promise resolving to enhanced sentence chains
   * 
   * Requirement 7.2: Check cache first
   * Requirement 7.3: Return cached content if valid
   * Requirement 7.4: Generate and cache on miss
   */
  getSentenceChainsWithCache(
    words: Word[],
    count: number
  ): Promise<EnhancedSentenceChain[]>;
}

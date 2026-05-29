/**
 * Enhanced Example Sentence Service Implementation
 * 
 * Orchestrates AI generation, context analysis, quality assessment, and caching
 * to provide high-quality, contextual example sentences.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 */

import { AIService, ApplicationContext } from '../ai/types';
import { ContextAnalyzer } from '../context/ContextAnalyzer';
import { QualityAssessor } from '../quality/QualityAssessor';
import { CacheManager } from '../cache/CacheManager';
import {
  EnhancedExampleSentenceService,
  EnhancedExampleSentence,
  ExampleGenerationOptions,
  ExampleGenerationResult,
} from './types';
import { ExampleSentence } from '../../types';

/**
 * Logger utility for EnhancedExampleSentenceService
 */
class EnhancedServiceLogger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(
      `[${new Date().toISOString()}] [ENHANCED_EXAMPLE_SERVICE] [INFO] ${message}`,
      context || ''
    );
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(
      `[${new Date().toISOString()}] [ENHANCED_EXAMPLE_SERVICE] [ERROR] ${message}`,
      context || ''
    );
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(
      `[${new Date().toISOString()}] [ENHANCED_EXAMPLE_SERVICE] [WARN] ${message}`,
      context || ''
    );
  }
}

/**
 * Enhanced Example Sentence Service Implementation
 * 
 * Orchestrates all components to generate high-quality, contextual examples:
 * 1. ContextAnalyzer - Identifies applicable scenarios
 * 2. AIService - Generates natural examples for each context
 * 3. QualityAssessor - Evaluates diversity and naturalness
 * 4. CacheManager - Manages persistent caching
 * 
 * Requirements:
 * - 1.1, 1.2, 1.3: Scenario-based generation
 * - 2.1, 2.2: Eliminate templates, ensure diversity
 * - 3.1, 3.2: Natural and idiomatic examples
 * - 4.1-4.6: Quality control and statistics
 */
export class EnhancedExampleSentenceServiceImpl
  implements EnhancedExampleSentenceService
{
  private aiService: AIService;
  private contextAnalyzer: ContextAnalyzer;
  private qualityAssessor: QualityAssessor;
  private cacheManager: CacheManager;

  // Default quality thresholds
  private readonly DEFAULT_DIVERSITY_THRESHOLD = 0.6;
  private readonly DEFAULT_NATURALNESS_THRESHOLD = 0.7;
  private readonly DEFAULT_MAX_RETRIES = 2;

  constructor(
    aiService: AIService,
    contextAnalyzer: ContextAnalyzer,
    qualityAssessor: QualityAssessor,
    cacheManager: CacheManager
  ) {
    this.aiService = aiService;
    this.contextAnalyzer = contextAnalyzer;
    this.qualityAssessor = qualityAssessor;
    this.cacheManager = cacheManager;

    EnhancedServiceLogger.info('EnhancedExampleSentenceService initialized');
  }

  /**
   * Generate enhanced examples with full quality control
   * 
   * Orchestration flow:
   * 1. Analyze word contexts (if not provided)
   * 2. Distribute example count across contexts
   * 3. Generate examples for each context using AI
   * 4. Assess quality (diversity and naturalness)
   * 5. Filter low-quality examples
   * 6. Retry if needed to meet quality thresholds
   * 
   * Requirements:
   * - 1.1: Identify application contexts
   * - 1.2: Generate at least 2 examples per context
   * - 1.3: Include at least 3 different contexts when applicable
   * - 2.3: Calculate diversity score
   * - 2.5: Ensure diversity score >= 0.6
   * - 4.1: Generate 12-15 examples per word
   * - 4.5: Retry on quality validation failure
   * - 4.6: Return generation statistics
   * - 9.3: Filter examples with naturalness < 0.7
   * - 9.5: Regenerate when filtered count is insufficient
   * 
   * @param word - The word to generate examples for
   * @param options - Generation options (count, contexts, quality thresholds)
   * @returns Promise resolving to examples with generation statistics
   */
  async generateEnhancedExamples(
    word: string,
    options: ExampleGenerationOptions
  ): Promise<ExampleGenerationResult> {
    const startTime = Date.now();
    const {
      count,
      contexts,
      minQualityScore = this.DEFAULT_NATURALNESS_THRESHOLD,
      maxRetries = this.DEFAULT_MAX_RETRIES,
    } = options;

    EnhancedServiceLogger.info('Starting enhanced example generation', {
      word,
      count,
      contexts,
      minQualityScore,
      maxRetries,
    });

    try {
      // Step 1: Analyze contexts if not provided
      // Requirement 1.1: Identify application context types
      const targetContexts =
        contexts ||
        (await this.contextAnalyzer.analyzeContexts(word)).contexts;

      EnhancedServiceLogger.info('Contexts identified', {
        word,
        contexts: targetContexts,
      });

      // Step 2: Distribute example count across contexts
      // Requirement 1.2: Generate at least 2 examples per context
      const examplesPerContext = Math.max(
        2,
        Math.ceil(count / targetContexts.length)
      );

      EnhancedServiceLogger.info('Distribution calculated', {
        word,
        examplesPerContext,
        totalContexts: targetContexts.length,
      });

      // Step 3: Generate examples for each context
      const allExamples: EnhancedExampleSentence[] = [];
      let totalGenerated = 0;

      for (const context of targetContexts) {
        let attempts = 0;
        let contextExamples: EnhancedExampleSentence[] = [];

        // Retry logic for each context
        while (
          attempts <= maxRetries &&
          contextExamples.length < examplesPerContext
        ) {
          try {
            EnhancedServiceLogger.info('Generating examples for context', {
              word,
              context,
              attempt: attempts + 1,
              target: examplesPerContext,
            });

            // Call AI service for generation
            // Requirement 3.1: Use AI service for natural generation
            const response = await this.aiService.generateExamples({
              word,
              context,
              count: examplesPerContext,
              constraints: {
                minLength: 8, // Requirement 4.2: 8-20 words
                maxLength: 20,
              },
            });

            // Enhance examples with metadata
            // Requirement 1.4: Label context in metadata
            const enhanced = response.examples.map((ex) => ({
              ...ex,
              context,
              metadata: {
                generatedAt: new Date(),
                model: response.metadata.model,
                tokensUsed: response.metadata.tokensUsed,
              },
            }));

            contextExamples = enhanced;
            totalGenerated += enhanced.length;

            EnhancedServiceLogger.info('Examples generated for context', {
              word,
              context,
              count: enhanced.length,
            });

            break; // Success, exit retry loop
          } catch (error: any) {
            attempts++;
            EnhancedServiceLogger.error(
              'Failed to generate examples for context',
              {
                word,
                context,
                attempt: attempts,
                error: error.message,
              }
            );

            // If max retries reached, continue to next context
            if (attempts > maxRetries) {
              EnhancedServiceLogger.warn(
                'Max retries reached for context, skipping',
                { word, context }
              );
            }
          }
        }

        allExamples.push(...contextExamples);
      }

      EnhancedServiceLogger.info('All contexts processed', {
        word,
        totalGenerated,
        targetCount: count,
      });

      // Step 4: Assess quality
      // Requirement 2.3: Calculate diversity score
      // Requirement 9.1: Implement naturalness score calculation
      const assessedExamples =
        await this.qualityAssessor.assessExamples(allExamples);

      EnhancedServiceLogger.info('Quality assessment completed', {
        word,
        assessedCount: assessedExamples.length,
      });

      // Step 5: Filter by quality score
      // Requirement 2.5: Filter examples with diversity < 0.6
      // Requirement 9.3: Filter examples with naturalness < 0.7
      const filteredExamples = assessedExamples.filter(
        (ex) =>
          (ex.diversityScore || 0) >= this.DEFAULT_DIVERSITY_THRESHOLD &&
          (ex.naturalnessScore || 0) >= minQualityScore
      );

      const filteredCount = totalGenerated - filteredExamples.length;

      EnhancedServiceLogger.info('Quality filtering completed', {
        word,
        totalGenerated,
        filtered: filteredCount,
        remaining: filteredExamples.length,
      });

      // Step 6: If not enough high-quality examples, retry
      // Requirement 4.5: Record failure reason and regenerate
      // Requirement 9.5: Regenerate when filtered count < minimum
      const minimumAcceptable = Math.floor(count * 0.8); // 80% of requested count

      if (filteredExamples.length < minimumAcceptable && maxRetries > 0) {
        EnhancedServiceLogger.warn(
          'Insufficient high-quality examples, retrying',
          {
            word,
            current: filteredExamples.length,
            minimum: minimumAcceptable,
            retriesLeft: maxRetries - 1,
          }
        );

        // Recursive retry with decremented maxRetries
        return this.generateEnhancedExamples(word, {
          ...options,
          maxRetries: maxRetries - 1,
        });
      }

      // Step 7: Return top examples sorted by quality
      const topExamples = filteredExamples
        .sort((a, b) => {
          const scoreA = (a.diversityScore || 0) + (a.naturalnessScore || 0);
          const scoreB = (b.diversityScore || 0) + (b.naturalnessScore || 0);
          return scoreB - scoreA;
        })
        .slice(0, count);

      // Calculate statistics
      // Requirement 4.6: Return actual count and quality statistics
      // Requirement 9.6: Record quality assessment statistics
      const statistics = {
        totalGenerated,
        filtered: filteredCount,
        averageDiversityScore: this.calculateAverage(
          topExamples.map((ex) => ex.diversityScore || 0)
        ),
        averageNaturalnessScore: this.calculateAverage(
          topExamples.map((ex) => ex.naturalnessScore || 0)
        ),
        generationTime: Date.now() - startTime,
      };

      EnhancedServiceLogger.info('Enhanced example generation completed', {
        word,
        finalCount: topExamples.length,
        statistics,
      });

      return {
        examples: topExamples,
        statistics,
      };
    } catch (error: any) {
      EnhancedServiceLogger.error('Enhanced example generation failed', {
        word,
        error: error.message,
      });

      // Return empty result with error statistics
      return {
        examples: [],
        statistics: {
          totalGenerated: 0,
          filtered: 0,
          averageDiversityScore: 0,
          averageNaturalnessScore: 0,
          generationTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get examples from cache or generate new ones
   * 
   * Cache-first strategy:
   * 1. Check cache for existing examples
   * 2. Return cached examples if valid (< 30 days old)
   * 3. Generate new examples if cache miss or expired
   * 4. Update cache with newly generated examples
   * 
   * Requirements:
   * - 7.2: Check cache first
   * - 7.3: Return cached examples if valid (< 30 days)
   * - 7.4: Generate new examples on cache miss/expiration
   * - 7.1: Cache newly generated examples
   * 
   * @param word - The word to get examples for
   * @param count - Number of examples to return
   * @returns Promise resolving to enhanced example sentences
   */
  async getExamplesWithCache(
    word: string,
    count: number
  ): Promise<EnhancedExampleSentence[]> {
    EnhancedServiceLogger.info('Getting examples with cache', { word, count });

    try {
      // Step 1: Check cache first
      // Requirement 7.2: Check cache for existing examples
      const cached = await this.cacheManager.get(word);

      // Step 2: Return cached examples if valid
      // Requirement 7.3: Return cached if within 30-day window
      if (cached && !this.cacheManager.isExpired(cached)) {
        EnhancedServiceLogger.info('Cache hit, returning cached examples', {
          word,
          cachedCount: cached.examples.length,
          generatedAt: cached.generatedAt,
        });

        return cached.examples.slice(0, count);
      }

      // Step 3: Generate new examples (cache miss or expired)
      // Requirement 7.4: Generate new examples when cache expired
      EnhancedServiceLogger.info(
        'Cache miss or expired, generating new examples',
        { word }
      );

      const result = await this.generateEnhancedExamples(word, { count });

      // Step 4: Save to cache
      // Requirement 7.1: Cache generated examples in local storage
      if (result.examples.length > 0) {
        await this.cacheManager.set(word, {
          examples: result.examples,
          generatedAt: new Date(),
        });

        EnhancedServiceLogger.info('New examples cached', {
          word,
          count: result.examples.length,
        });
      }

      return result.examples;
    } catch (error: any) {
      EnhancedServiceLogger.error('Failed to get examples with cache', {
        word,
        error: error.message,
      });

      // Return empty array on error
      return [];
    }
  }

  /**
   * Legacy method: Get examples in base format (backward compatibility)
   * 
   * Converts EnhancedExampleSentence to base ExampleSentence format
   * by stripping enhanced fields (context, scores, metadata).
   * This ensures existing code that uses ExampleSentenceService continues to work.
   * 
   * Requirements:
   * - 4.1: Implement legacy getExamples method
   * - 4.2: Convert EnhancedExampleSentence to ExampleSentence format
   * - 4.3: Ensure existing code continues to work
   * 
   * @param word - The word to get examples for
   * @param count - Number of examples to return
   * @returns Promise resolving to base example sentences (without enhanced fields)
   */
  async getExamples(word: string, count: number): Promise<ExampleSentence[]> {
    EnhancedServiceLogger.info('Getting examples (legacy format)', {
      word,
      count,
    });

    try {
      // Get enhanced examples from cache or generate new ones
      const enhanced = await this.getExamplesWithCache(word, count);

      // Convert to base format by stripping enhanced fields
      const baseExamples: ExampleSentence[] = enhanced.map((ex) => ({
        sentence: ex.sentence,
        translation: ex.translation,
        highlightWord: ex.highlightWord,
      }));

      EnhancedServiceLogger.info('Converted to legacy format', {
        word,
        count: baseExamples.length,
      });

      return baseExamples;
    } catch (error: any) {
      EnhancedServiceLogger.error('Failed to get examples (legacy format)', {
        word,
        error: error.message,
      });

      // Return empty array on error
      return [];
    }
  }

  /**
   * Legacy method: Validate example sentences (backward compatibility)
   * 
   * Validates that examples meet basic requirements:
   * - Non-empty sentence and translation
   * - Contains highlight word (case-insensitive)
   * 
   * Requirements:
   * - 4.4: Implement legacy validateExamples method
   * - 4.3: Ensure existing code continues to work
   * 
   * @param examples - Array of example sentences to validate
   * @returns true if all examples are valid, false otherwise
   */
  validateExamples(examples: ExampleSentence[]): boolean {
    EnhancedServiceLogger.info('Validating examples (legacy method)', {
      count: examples.length,
    });

    // Check if examples array is not empty
    if (!examples || examples.length === 0) {
      EnhancedServiceLogger.warn('No examples to validate');
      return false;
    }

    // Validate each example
    for (const example of examples) {
      // Check if sentence exists and is not empty
      if (!example.sentence || example.sentence.trim().length === 0) {
        EnhancedServiceLogger.warn('Invalid example: empty sentence', {
          example,
        });
        return false;
      }

      // Check if translation exists and is not empty
      if (!example.translation || example.translation.trim().length === 0) {
        EnhancedServiceLogger.warn('Invalid example: empty translation', {
          example,
        });
        return false;
      }

      // Check if highlightWord exists
      if (!example.highlightWord || example.highlightWord.trim().length === 0) {
        EnhancedServiceLogger.warn('Invalid example: empty highlightWord', {
          example,
        });
        return false;
      }

      // Check if sentence contains the highlight word (case-insensitive)
      const sentenceLower = example.sentence.toLowerCase();
      const highlightLower = example.highlightWord.toLowerCase();

      if (!sentenceLower.includes(highlightLower)) {
        EnhancedServiceLogger.warn(
          'Invalid example: sentence does not contain highlight word',
          {
            sentence: example.sentence,
            highlightWord: example.highlightWord,
          }
        );
        return false;
      }
    }

    EnhancedServiceLogger.info('Example validation passed', {
      count: examples.length,
    });
    return true;
  }

  /**
   * Calculate average of an array of numbers
   * 
   * @param numbers - Array of numbers
   * @returns Average value, or 0 if array is empty
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }
}

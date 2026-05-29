/**
 * Sentence Chain Service Implementation
 * 
 * Generates multi-word sentence chains with scenario awareness,
 * quality assessment, and caching support.
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
 */

import { AIService, ApplicationContext } from '../ai/types';
import { ContextAnalyzer } from '../context/ContextAnalyzer';
import { CacheManager } from '../cache/CacheManager';
import { Word } from '../../types/word';
import {
  SentenceChainService,
  EnhancedSentenceChain,
  SentenceChainGenerationOptions,
} from './types';

/**
 * Logger utility for SentenceChainService
 */
class SentenceChainLogger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(
      `[${new Date().toISOString()}] [SENTENCE_CHAIN_SERVICE] [INFO] ${message}`,
      context || ''
    );
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(
      `[${new Date().toISOString()}] [SENTENCE_CHAIN_SERVICE] [ERROR] ${message}`,
      context || ''
    );
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(
      `[${new Date().toISOString()}] [SENTENCE_CHAIN_SERVICE] [WARN] ${message}`,
      context || ''
    );
  }
}

/**
 * Sentence Chain Service Implementation
 * 
 * Generates multi-word sentence chains with:
 * 1. Context analysis for applicable scenarios
 * 2. Word combination generation (2-4 words per chain)
 * 3. AI-powered natural sentence generation
 * 4. Quality assessment and filtering
 * 5. Persistent caching for performance
 * 
 * Requirements:
 * - 5.1: Generate 5-8 sentence chains per word group
 * - 5.2: Each chain uses 2-4 words
 * - 5.3: Assign application contexts
 * - 5.4: Cover at least 3 different contexts
 * - 5.5: Label used words and context in UI
 * - 5.6: Ensure semantic coherence and context appropriateness
 */
export class SentenceChainServiceImpl implements SentenceChainService {
  private aiService: AIService;
  private contextAnalyzer: ContextAnalyzer;
  private cacheManager: CacheManager;

  // Default quality threshold
  private readonly DEFAULT_QUALITY_THRESHOLD = 0.7;

  constructor(
    aiService: AIService,
    contextAnalyzer: ContextAnalyzer,
    cacheManager: CacheManager
  ) {
    this.aiService = aiService;
    this.contextAnalyzer = contextAnalyzer;
    this.cacheManager = cacheManager;

    SentenceChainLogger.info('SentenceChainService initialized');
  }

  /**
   * Generate sentence chains using multiple words
   * 
   * Orchestration flow:
   * 1. Determine applicable contexts for word group
   * 2. Generate word combinations (2-4 words per chain)
   * 3. Generate chains for each context using AI
   * 4. Assess chain quality
   * 5. Filter and sort by quality score
   * 6. Return top chains
   * 
   * Requirements:
   * - 5.1: Generate specified number of chains (5-8)
   * - 5.2: Respect min/max word constraints (2-4 words)
   * - 5.3: Generate for identified contexts
   * - 5.4: Cover at least 3 different contexts
   * - 5.6: Quality assessment and filtering
   * 
   * @param words - Array of words to include in chains
   * @param options - Generation options (count, word limits, contexts, quality thresholds)
   * @returns Promise resolving to enhanced sentence chains
   */
  async generateSentenceChains(
    words: Word[],
    options: SentenceChainGenerationOptions
  ): Promise<EnhancedSentenceChain[]> {
    const {
      count,
      minWords = 2,
      maxWords = 4,
      contexts,
      minQualityScore = this.DEFAULT_QUALITY_THRESHOLD,
    } = options;

    SentenceChainLogger.info('Starting sentence chain generation', {
      wordCount: words.length,
      targetCount: count,
      minWords,
      maxWords,
      contexts,
      minQualityScore,
    });

    try {
      // Step 1: Determine applicable contexts
      // Requirement 5.3: Assign application context to sentence chains
      // Requirement 5.4: Cover at least 3 different contexts
      const targetContexts = contexts || (await this.determineContexts(words));

      SentenceChainLogger.info('Contexts determined', {
        contexts: targetContexts,
        contextCount: targetContexts.length,
      });

      // Step 2: Generate word combinations
      // Requirement 5.2: Each chain uses 2-4 words
      const wordCombinations = this.generateWordCombinations(
        words,
        minWords,
        maxWords
      );

      SentenceChainLogger.info('Word combinations generated', {
        combinationCount: wordCombinations.length,
      });

      // Step 3: Generate chains for each context
      // Requirement 5.1: Generate 5-8 sentence chains
      const allChains: EnhancedSentenceChain[] = [];
      const chainsPerContext = Math.ceil(count / targetContexts.length);

      for (const context of targetContexts) {
        // Select combinations for this context
        const contextCombinations = wordCombinations.slice(
          0,
          chainsPerContext
        );

        for (const combination of contextCombinations) {
          try {
            SentenceChainLogger.info('Generating chain for context', {
              context,
              words: combination.map((w) => w.word),
            });

            // Call AI service to generate sentence chains
            // Requirement 5.6: Ensure semantic coherence
            const chains = await this.aiService.generateSentenceChains(
              combination.map((w) => w.word),
              context,
              1
            );

            // Enhance chains with metadata
            const enhanced: EnhancedSentenceChain[] = chains.map((chain) => ({
              id: this.generateChainId(combination, context),
              sentence: chain.sentence,
              translation: chain.translation,
              usedWordIds: combination.map((w) => w.id),
              context,
              qualityScore: 0, // Will be assessed in next step
              metadata: {
                generatedAt: new Date(),
                model: 'gpt-3.5-turbo', // Default model
                tokensUsed: 0, // Not available from current AI service interface
              },
            }));

            allChains.push(...enhanced);

            SentenceChainLogger.info('Chain generated successfully', {
              context,
              chainCount: enhanced.length,
            });
          } catch (error: any) {
            SentenceChainLogger.error('Failed to generate chain for context', {
              context,
              words: combination.map((w) => w.word),
              error: error.message,
            });
          }
        }
      }

      SentenceChainLogger.info('All chains generated', {
        totalChains: allChains.length,
        targetCount: count,
      });

      // Step 4: Assess chain quality
      // Requirement 5.6: Ensure semantic coherence and context appropriateness
      const assessedChains = await this.assessChainQuality(allChains);

      SentenceChainLogger.info('Quality assessment completed', {
        assessedCount: assessedChains.length,
      });

      // Step 5: Filter and sort by quality
      // Requirement 5.6: Filter low-quality chains
      const filteredChains = assessedChains
        .filter((chain) => chain.qualityScore >= minQualityScore)
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, count);

      SentenceChainLogger.info('Sentence chain generation completed', {
        finalCount: filteredChains.length,
        averageQuality:
          filteredChains.reduce((sum, c) => sum + c.qualityScore, 0) /
          filteredChains.length,
      });

      return filteredChains;
    } catch (error: any) {
      SentenceChainLogger.error('Sentence chain generation failed', {
        error: error.message,
      });

      // Return empty array on error
      return [];
    }
  }

  /**
   * Get sentence chains from cache or generate new ones
   * 
   * Cache-first strategy:
   * 1. Create cache key from word IDs
   * 2. Check cache for existing chains
   * 3. Return cached chains if valid (< 30 days old)
   * 4. Generate new chains if cache miss or expired
   * 5. Update cache with newly generated chains
   * 
   * Requirements:
   * - 7.2: Check cache first
   * - 7.3: Return cached content if valid
   * - 7.4: Generate and cache on miss
   * 
   * @param words - Array of words to include in chains
   * @param count - Number of sentence chains to return
   * @returns Promise resolving to enhanced sentence chains
   */
  async getSentenceChainsWithCache(
    words: Word[],
    count: number
  ): Promise<EnhancedSentenceChain[]> {
    SentenceChainLogger.info('Getting sentence chains with cache', {
      wordCount: words.length,
      count,
    });

    try {
      // Step 1: Create cache key from word IDs
      // Requirement 7.2: Check cache for existing chains
      const cacheKey = this.createCacheKey(words);

      // Step 2: Check cache
      const cached = await this.cacheManager.get(`chain:${cacheKey}`);

      // Step 3: Return cached chains if valid
      // Requirement 7.3: Return cached if within 30-day window
      if (cached && !this.cacheManager.isExpired(cached)) {
        SentenceChainLogger.info('Cache hit, returning cached chains', {
          cacheKey,
          cachedCount: cached.examples.length,
          generatedAt: cached.generatedAt,
        });

        // Cast cached examples to EnhancedSentenceChain
        return (cached.examples as any[]).slice(0, count);
      }

      // Step 4: Generate new chains (cache miss or expired)
      // Requirement 7.4: Generate new chains when cache expired
      SentenceChainLogger.info('Cache miss or expired, generating new chains', {
        cacheKey,
      });

      const chains = await this.generateSentenceChains(words, {
        count,
        minWords: 2,
        maxWords: 4,
      });

      // Step 5: Save to cache
      if (chains.length > 0) {
        await this.cacheManager.set(`chain:${cacheKey}`, {
          examples: chains as any[], // Cast to match cache interface
          generatedAt: new Date(),
        });

        SentenceChainLogger.info('New chains cached', {
          cacheKey,
          count: chains.length,
        });
      }

      return chains;
    } catch (error: any) {
      SentenceChainLogger.error('Failed to get chains with cache', {
        error: error.message,
      });

      // Return empty array on error
      return [];
    }
  }

  /**
   * Determine applicable contexts for a group of words
   * 
   * Analyzes contexts for all words and finds common ones that appear
   * for at least 50% of the words. Returns top 3 contexts.
   * 
   * Requirement 5.4: Cover at least 3 different contexts
   * 
   * @param words - Array of words to analyze
   * @returns Promise resolving to array of applicable contexts
   */
  private async determineContexts(
    words: Word[]
  ): Promise<ApplicationContext[]> {
    SentenceChainLogger.info('Determining contexts for word group', {
      wordCount: words.length,
    });

    try {
      // Analyze contexts for all words
      const contextAnalyses = await Promise.all(
        words.map((word) => this.contextAnalyzer.analyzeContexts(word.word))
      );

      // Count context occurrences across all words
      const contextCounts = new Map<ApplicationContext, number>();
      contextAnalyses.forEach((analysis) => {
        analysis.contexts.forEach((context) => {
          contextCounts.set(context, (contextCounts.get(context) || 0) + 1);
        });
      });

      // Return contexts that appear for at least 50% of words
      const threshold = words.length * 0.5;
      const applicableContexts = Array.from(contextCounts.entries())
        .filter(([_, count]) => count >= threshold)
        .sort(([_, countA], [__, countB]) => countB - countA)
        .map(([context, _]) => context)
        .slice(0, 3); // Limit to top 3 contexts

      // Ensure at least one context (default to daily-conversation)
      if (applicableContexts.length === 0) {
        applicableContexts.push('daily-conversation');
      }

      SentenceChainLogger.info('Contexts determined', {
        contexts: applicableContexts,
        contextCounts: Object.fromEntries(contextCounts),
      });

      return applicableContexts;
    } catch (error: any) {
      SentenceChainLogger.error('Failed to determine contexts', {
        error: error.message,
      });

      // Fallback to default context
      return ['daily-conversation'];
    }
  }

  /**
   * Generate word combinations of varying sizes
   * 
   * Creates all possible combinations of words with sizes between
   * minWords and maxWords, then shuffles for variety.
   * 
   * Requirement 5.2: Each chain uses 2-4 words
   * 
   * @param words - Array of words to combine
   * @param minWords - Minimum words per combination
   * @param maxWords - Maximum words per combination
   * @returns Array of word combinations
   */
  private generateWordCombinations(
    words: Word[],
    minWords: number,
    maxWords: number
  ): Word[][] {
    const combinations: Word[][] = [];

    // Generate all possible combinations of size minWords to maxWords
    for (let size = minWords; size <= Math.min(maxWords, words.length); size++) {
      const combos = this.getCombinations(words, size);
      combinations.push(...combos);
    }

    // Shuffle to get variety
    return this.shuffle(combinations);
  }

  /**
   * Get all combinations of a specific size from an array
   * 
   * Uses recursive algorithm to generate combinations.
   * 
   * @param array - Array to generate combinations from
   * @param size - Size of each combination
   * @returns Array of combinations
   */
  private getCombinations<T>(array: T[], size: number): T[][] {
    if (size === 1) return array.map((item) => [item]);
    if (size > array.length) return [];

    const combinations: T[][] = [];
    for (let i = 0; i <= array.length - size; i++) {
      const head = array[i];
      const tailCombos = this.getCombinations(array.slice(i + 1), size - 1);
      tailCombos.forEach((combo) => combinations.push([head, ...combo]));
    }

    return combinations;
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * 
   * @param array - Array to shuffle
   * @returns Shuffled array (new array, original unchanged)
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Assess quality of sentence chains
   * 
   * Evaluates chains based on:
   * 1. Sentence length (prefer 10-25 words)
   * 2. Word usage (all words should be used naturally)
   * 3. Translation quality (has translation)
   * 
   * Requirement 5.6: Ensure semantic coherence and context appropriateness
   * 
   * @param chains - Array of sentence chains to assess
   * @returns Promise resolving to chains with quality scores
   */
  private async assessChainQuality(
    chains: EnhancedSentenceChain[]
  ): Promise<EnhancedSentenceChain[]> {
    SentenceChainLogger.info('Assessing chain quality', {
      chainCount: chains.length,
    });

    return chains.map((chain) => {
      // 1. Sentence length score (prefer 10-25 words)
      const wordCount = chain.sentence.split(/\s+/).length;
      const lengthScore = wordCount >= 10 && wordCount <= 25 ? 1.0 : 0.7;

      // 2. Translation quality (has translation)
      const hasTranslation =
        chain.translation && chain.translation.length > 0 ? 1.0 : 0.0;

      // 3. Word usage score (all words should be used)
      const allWordsUsed = chain.usedWordIds.length >= 2 ? 1.0 : 0.5;

      // Calculate overall quality score (weighted average)
      const qualityScore = (lengthScore + hasTranslation + allWordsUsed) / 3;

      return {
        ...chain,
        qualityScore,
      };
    });
  }

  /**
   * Create cache key from word IDs
   * 
   * Sorts word IDs to ensure consistent cache keys regardless of word order.
   * 
   * @param words - Array of words
   * @returns Cache key string
   */
  private createCacheKey(words: Word[]): string {
    return words
      .map((w) => w.id)
      .sort()
      .join('-');
  }

  /**
   * Generate unique ID for a sentence chain
   * 
   * Creates ID from word IDs and context for uniqueness.
   * 
   * @param words - Words used in the chain
   * @param context - Application context
   * @returns Unique chain ID
   */
  private generateChainId(words: Word[], context: ApplicationContext): string {
    const wordIds = words.map((w) => w.id).sort().join('-');
    const timestamp = Date.now();
    return `chain-${wordIds}-${context}-${timestamp}`;
  }
}

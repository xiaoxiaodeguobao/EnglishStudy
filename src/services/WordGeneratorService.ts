/**
 * WordGeneratorService Implementation
 *
 * Generates daily word lists with associations and sentence chains using AI.
 * Requirements: 3.1, 3.2, 3.3, 3.6, 4.1, 4.3, 6.4, 7.1, 7.4, 7.5
 */

import type {
  WordGeneratorService,
  DailyWordList,
  Word,
  WordAssociation,
  SentenceChain,
} from '../types';
import { GenerationError } from '../types/error';
import { calculateAssociationRate } from '../utils/wordAssociation';
import { storageService } from './StorageService';
import { createAIProvider } from './ai/AIProviderFactory';
import { getEnvConfig } from '../utils/envConfig';
import type { AIService } from './ai/types';
import { AIServiceError } from './ai/types';
import { RetryExhaustedError } from './ai/RetryHandler';
import {
  validateAndFilterWords,
  resolveAssociationIds,
  filterValidSentenceChainWords,
} from './ai/WordListResponseParser';

/**
 * Logger utility
 * Logs are only output when debug mode is enabled in environment config
 */
class Logger {
  private static isDebugMode(): boolean {
    try {
      const config = getEnvConfig();
      return config.debugMode;
    } catch {
      return false;
    }
  }

  static info(message: string, context?: Record<string, unknown>): void {
    if (this.isDebugMode()) {
      console.info(`[${new Date().toISOString()}] [INFO] ${message}`, context || '');
    }
  }

  static error(message: string, context?: Record<string, unknown>): void {
    if (this.isDebugMode()) {
      console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, context || '');
    }
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    if (this.isDebugMode()) {
      console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, context || '');
    }
  }
}

/**
 * Generate a unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * WordGeneratorService implementation
 *
 * Uses the AI provider factory to obtain the configured AI adapter and
 * generates daily word lists via a single `generateWordList()` call.
 *
 * Requirements: 6.4, 7.1, 7.4, 7.5
 */
export class WordGeneratorServiceImpl implements WordGeneratorService {
  private readonly ASSOCIATION_THRESHOLD = 0.8; // 80% requirement

  /**
   * Get a fresh AI service instance on every call so that changes made
   * on the Settings page (stored in localStorage) are picked up immediately
   * without requiring a page reload.
   */
  private getAIService(): { service: AIService; providerName: string } {
    const config = getEnvConfig();
    return {
      service: createAIProvider(config.aiProvider, config),
      providerName: config.aiProvider,
    };
  }

  /**
   * Generate daily words with associations
   * Requirements: 3.1, 3.2, 3.3, 3.6, 4.1, 4.3, 7.1, 7.4, 7.5
   */
  async generateDailyWords(
    planId: string,
    date: Date,
    count: number
  ): Promise<DailyWordList> {
    try {
      Logger.info('Generating daily words', { planId, date: date.toISOString(), count });

      // Get used words to avoid duplicates
      const usedWords = await this.getUsedWords(planId);
      Logger.info('Retrieved used words', { count: usedWords.length });

      // Get a fresh AI service instance (picks up latest user settings)
      const { service: aiService, providerName } = this.getAIService();

      // Requirement 7.4: Log INFO before API call with provider name, request summary
      const startTime = Date.now();
      Logger.info('Calling AI provider for word list generation', {
        provider: providerName,
        requestSummary: { count, usedWordsCount: usedWords.length },
      });

      let rawResponse;
      try {
        // Requirement 7.1: Call aiService.generateWordList() instead of mock logic
        rawResponse = await aiService.generateWordList({
          count,
          usedWords,
        });
      } catch (apiError) {
        const elapsedMs = Date.now() - startTime;

        // Requirement 7.5: Log ERROR on API failure with error type, HTTP status, message
        if (apiError instanceof AIServiceError) {
          Logger.error('AI provider API call failed', {
            provider: providerName,
            errorType: apiError.name,
            statusCode: apiError.statusCode,
            message: apiError.message,
            elapsedMs,
          });
        } else {
          const err = apiError as Error;
          Logger.error('AI provider API call failed', {
            provider: providerName,
            errorType: err.name || 'Error',
            message: err.message,
            elapsedMs,
          });
        }

        throw apiError;
      }

      const elapsedMs = Date.now() - startTime;

      // Requirement 7.4: Log INFO after API call with elapsed time
      Logger.info('AI provider returned word list response', {
        provider: providerName,
        elapsedMs,
        rawWordCount: rawResponse.words.length,
        rawAssociationCount: rawResponse.associations.length,
        rawSentenceChainCount: rawResponse.sentenceChains.length,
      });

      // Parse and validate words using WordListResponseParser
      const validRawWords = validateAndFilterWords(rawResponse.words);

      if (validRawWords.length < count) {
        Logger.warn('AI returned fewer valid words than requested', {
          requested: count,
          received: validRawWords.length,
        });
      }

      // Convert RawWordData to Word objects (client generates IDs)
      const words: Word[] = validRawWords.map((raw) => ({
        id: generateId('word'),
        word: raw.word,
        phonetic: raw.phonetic,
        definitions: raw.definitions,
        examples: raw.examples,
        associations: [],
        generatedAt: new Date(),
      }));

      // Resolve text-based associations to ID-based WordAssociation objects
      const associations: WordAssociation[] = resolveAssociationIds(
        rawResponse.associations,
        words
      );

      // Validate association rate
      const associationRate = calculateAssociationRate(words, associations);
      Logger.info('Association rate calculated', { rate: associationRate });

      if (associationRate < this.ASSOCIATION_THRESHOLD) {
        Logger.warn('Association rate below threshold', {
          rate: associationRate,
          threshold: this.ASSOCIATION_THRESHOLD,
        });
        throw new GenerationError('生成的单词关联性不足');
      }

      // Filter sentence chains to only include words in the daily list
      // Requirement 5.3: Filter out usedWords not in the daily word list
      const sentenceChains: SentenceChain[] = filterValidSentenceChainWords(
        rawResponse.sentenceChains,
        words
      );

      // Requirement 5.4: When valid sentence chain count < 3, throw GenerationError
      if (sentenceChains.length < 3) {
        Logger.warn('Sentence chain count below minimum', {
          count: sentenceChains.length,
          minimum: 3,
        });
        throw new GenerationError('生成的句子链数量不足');
      }

      const wordList: DailyWordList = {
        id: generateId('list'),
        date,
        planId,
        words,
        associations,
        sentenceChains,
      };

      Logger.info('Daily word list generated successfully', {
        wordCount: words.length,
        associationCount: associations.length,
        sentenceChainCount: sentenceChains.length,
      });

      return wordList;
    } catch (error) {
      Logger.error('Failed to generate daily words', {
        planId,
        date: date.toISOString(),
        count,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof GenerationError) {
        throw error;
      }

      // Requirement 7.2: RetryExhaustedError → GenerationError with provider name and last failure reason
      if (error instanceof RetryExhaustedError) {
        const lastErr = error.lastError;
        const { providerName: pName } = this.getAIService();
        if (lastErr instanceof AIServiceError) {
          let message: string;
          if (lastErr.statusCode === 402) {
            message = `AI 服务（${lastErr.provider}）账户余额不足，请充值后重试`;
          } else if (lastErr.statusCode === 401) {
            message = `AI 服务（${lastErr.provider}）API Key 无效，请检查配置`;
          } else if (lastErr.statusCode === 403) {
            message = `AI 服务（${lastErr.provider}）访问被拒绝，请检查 API Key 权限`;
          } else if (lastErr.statusCode === 429) {
            message = `AI 服务（${lastErr.provider}）请求过于频繁，请稍后重试`;
          } else {
            message = `AI 服务（${pName}）重试耗尽：${lastErr.message}`;
          }
          throw new GenerationError(message);
        }
        throw new GenerationError(
          `AI 服务（${pName}）重试耗尽：${error.lastError.message}`
        );
      }

      if (error instanceof AIServiceError) {
        // Provide user-friendly messages for common HTTP errors
        let message: string;
        if (error.statusCode === 402) {
          message = `AI 服务（${error.provider}）账户余额不足，请充值后重试`;
        } else if (error.statusCode === 401) {
          message = `AI 服务（${error.provider}）API Key 无效，请检查配置`;
        } else if (error.statusCode === 403) {
          message = `AI 服务（${error.provider}）访问被拒绝，请检查 API Key 权限`;
        } else if (error.statusCode === 429) {
          message = `AI 服务（${error.provider}）请求过于频繁，请稍后重试`;
        } else {
          message = `AI 服务（${error.provider}）调用失败：${error.message}`;
        }
        throw new GenerationError(message);
      }

      throw new GenerationError('无法生成单词列表');
    }
  }

  /**
   * Validate associations meet threshold
   * Requirements: 4.1
   */
  async validateAssociations(words: Word[]): Promise<boolean> {
    Logger.info('Validating associations', { wordCount: words.length });

    if (words.length < 2) {
      return true;
    }

    // Extract associations from words
    const associations: WordAssociation[] = [];
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        if (words[i].associations.includes(words[j].id)) {
          associations.push({
            word1Id: words[i].id,
            word2Id: words[j].id,
            associationType: 'theme',
            description: 'Associated words',
          });
        }
      }
    }

    const rate = calculateAssociationRate(words, associations);
    const isValid = rate >= this.ASSOCIATION_THRESHOLD;

    Logger.info('Association validation result', { rate, isValid });

    return isValid;
  }

  /**
   * Get used words for a plan to avoid duplicates
   * Requirements: 3.5
   */
  async getUsedWords(planId: string): Promise<string[]> {
    try {
      Logger.info('Getting used words', { planId });

      const wordLists = await storageService.loadAllWordLists(planId);
      const usedWords = new Set<string>();

      for (const wordList of wordLists) {
        for (const word of wordList.words) {
          usedWords.add(word.word.toLowerCase());
        }
      }

      Logger.info('Used words retrieved', { count: usedWords.size });

      return Array.from(usedWords);
    } catch (error) {
      Logger.error('Failed to get used words', {
        planId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return empty array on error to allow generation to continue
      return [];
    }
  }
}

// Export singleton instance
export const wordGeneratorService = new WordGeneratorServiceImpl();

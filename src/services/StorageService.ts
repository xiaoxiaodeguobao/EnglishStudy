/**
 * StorageService Implementation
 * 
 * Provides data persistence operations using VocabularyDB (Dexie.js) and LocalStorage.
 * Implements the StorageService interface with comprehensive error handling and logging.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 9.2, 9.4
 */

import { db } from './VocabularyDB';
import type {
  StorageService,
  LearningPlan,
  DailyWordList,
  LearningProgress,
  Word,
} from '../types';
import { StorageError } from '../types/error';

/**
 * Logger utility for error and info logging
 */
class Logger {
  private static log(
    level: 'info' | 'error' | 'warn',
    message: string,
    context?: Record<string, any>
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context) {
      console[level](logMessage, context);
    } else {
      console[level](logMessage);
    }
  }

  static info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  static error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  static warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }
}

/**
 * StorageService implementation using Dexie.js and LocalStorage
 */
export class StorageServiceImpl implements StorageService {
  private readonly CURRENT_PLAN_KEY = 'currentPlanId';

  // ==================== Learning Plan Operations ====================

  /**
   * Save a learning plan to IndexedDB and set it as current plan
   * Requirements: 10.1
   */
  async savePlan(plan: LearningPlan): Promise<void> {
    try {
      Logger.info('Saving learning plan', { planId: plan.id });
      
      await db.learningPlans.put(plan);
      localStorage.setItem(this.CURRENT_PLAN_KEY, plan.id);
      
      Logger.info('Learning plan saved successfully', { planId: plan.id });
    } catch (error) {
      Logger.error('Failed to save learning plan', {
        planId: plan.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法保存学习计划');
    }
  }

  /**
   * Load a learning plan by ID from IndexedDB
   * Requirements: 10.1
   */
  async loadPlan(id: string): Promise<LearningPlan | null> {
    try {
      Logger.info('Loading learning plan', { planId: id });
      
      const plan = await db.learningPlans.get(id);
      
      if (plan) {
        Logger.info('Learning plan loaded successfully', { planId: id });
      } else {
        Logger.warn('Learning plan not found', { planId: id });
      }
      
      return plan || null;
    } catch (error) {
      Logger.error('Failed to load learning plan', {
        planId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法加载学习计划');
    }
  }

  /**
   * Load the current active learning plan
   * Requirements: 10.1
   */
  async loadCurrentPlan(): Promise<LearningPlan | null> {
    try {
      const currentPlanId = localStorage.getItem(this.CURRENT_PLAN_KEY);
      
      if (!currentPlanId) {
        Logger.info('No current plan ID found in localStorage');
        return null;
      }
      
      Logger.info('Loading current learning plan', { planId: currentPlanId });
      return await this.loadPlan(currentPlanId);
    } catch (error) {
      Logger.error('Failed to load current learning plan', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法加载当前学习计划');
    }
  }

  // ==================== Daily Word List Operations ====================

  /**
   * Save a daily word list to IndexedDB
   * Requirements: 10.2
   */
  async saveDailyWordList(wordList: DailyWordList): Promise<void> {
    try {
      // Normalize date to midnight to ensure consistent date-based lookup
      const normalizedWordList = {
        ...wordList,
        date: this.normalizeDateToMidnight(wordList.date),
      };

      Logger.info('Saving daily word list', {
        wordListId: normalizedWordList.id,
        date: normalizedWordList.date.toISOString(),
        wordCount: normalizedWordList.words.length,
      });
      
      // Save the word list
      await db.dailyWordLists.put(normalizedWordList);
      
      // Save individual words to the words table for search functionality
      const wordPromises = normalizedWordList.words.map(word => db.words.put(word));
      await Promise.all(wordPromises);
      
      Logger.info('Daily word list saved successfully', {
        wordListId: normalizedWordList.id,
        wordCount: normalizedWordList.words.length,
      });
    } catch (error) {
      Logger.error('Failed to save daily word list', {
        wordListId: wordList.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法保存每日单词列表');
    }
  }

  /**
   * Load a daily word list by date
   * Requirements: 10.2
   */
  async loadDailyWordList(date: Date): Promise<DailyWordList | null> {
    try {
      const dateString = this.normalizeDateString(date);
      Logger.info('Loading daily word list', { date: dateString });
      
      // Normalize to midnight for consistent matching
      const midnight = this.normalizeDateToMidnight(date);

      // Query by date index using normalized midnight date
      const wordList = await db.dailyWordLists
        .where('date')
        .equals(midnight)
        .first();
      
      if (wordList) {
        Logger.info('Daily word list loaded from cache', {
          wordListId: wordList.id,
          date: dateString,
          wordCount: wordList.words.length,
        });
      } else {
        Logger.info('No cached word list found for date', { date: dateString });
      }
      
      return wordList || null;
    } catch (error) {
      Logger.error('Failed to load daily word list', {
        date: date.toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法加载每日单词列表');
    }
  }

  /**
   * Load all word lists for a specific learning plan
   * Requirements: 10.2
   */
  async loadAllWordLists(planId: string): Promise<DailyWordList[]> {
    try {
      Logger.info('Loading all word lists for plan', { planId });
      
      const wordLists = await db.dailyWordLists
        .where('planId')
        .equals(planId)
        .toArray();
      
      Logger.info('Word lists loaded successfully', {
        planId,
        count: wordLists.length,
      });
      
      return wordLists;
    } catch (error) {
      Logger.error('Failed to load word lists', {
        planId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法加载单词列表');
    }
  }

  // ==================== Progress Operations ====================

  /**
   * Save learning progress to IndexedDB
   * Requirements: 10.3
   */
  async saveProgress(progress: LearningProgress): Promise<void> {
    try {
      Logger.info('Saving learning progress', {
        planId: progress.planId,
        completedDays: progress.completedDays,
        totalWords: progress.totalWords,
      });
      
      await db.learningProgress.put(progress);
      
      Logger.info('Learning progress saved successfully', {
        planId: progress.planId,
      });
    } catch (error) {
      Logger.error('Failed to save learning progress', {
        planId: progress.planId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法保存学习进度');
    }
  }

  /**
   * Load learning progress for a specific plan
   * Requirements: 10.3
   */
  async loadProgress(planId: string): Promise<LearningProgress | null> {
    try {
      Logger.info('Loading learning progress', { planId });
      
      const progress = await db.learningProgress.get(planId);
      
      if (progress) {
        Logger.info('Learning progress loaded successfully', {
          planId,
          completedDays: progress.completedDays,
        });
      } else {
        Logger.warn('Learning progress not found', { planId });
      }
      
      return progress || null;
    } catch (error) {
      Logger.error('Failed to load learning progress', {
        planId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法加载学习进度');
    }
  }

  // ==================== History and Search Operations ====================

  /**
   * Search for words by query string (case-insensitive)
   * Requirements: 9.4
   */
  async searchWords(query: string): Promise<Word[]> {
    try {
      const lowerQuery = query.toLowerCase();
      const trimmedQuery = lowerQuery.trim();
      Logger.info('Searching words', { query: lowerQuery });
      
      if (!trimmedQuery) {
        Logger.warn('Empty search query provided');
        return [];
      }
      
      // Search using the word index - use the original (untrimmed) lowercase query
      // so that results actually contain the search keyword as provided
      const words = await db.words
        .filter(word => word.word.toLowerCase().includes(lowerQuery))
        .toArray();
      
      Logger.info('Word search completed', {
        query: lowerQuery,
        resultCount: words.length,
      });
      
      return words;
    } catch (error) {
      Logger.error('Failed to search words', {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StorageError('无法搜索单词');
    }
  }

  /**
   * Get words generated within a specific date range
   * Requirements: 9.2
   */
  async getWordsByDateRange(startDate: Date, endDate: Date): Promise<Word[]> {
    try {
      Logger.info('Getting words by date range', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      
      // Validate date range
      if (startDate > endDate) {
        Logger.warn('Invalid date range: startDate is after endDate', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        throw new StorageError('开始日期不能晚于结束日期');
      }
      
      // Query words by generatedAt date
      const words = await db.words
        .where('generatedAt')
        .between(startDate, endDate, true, true)
        .toArray();
      
      Logger.info('Words retrieved by date range', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        resultCount: words.length,
      });
      
      return words;
    } catch (error) {
      Logger.error('Failed to get words by date range', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      
      if (error instanceof StorageError) {
        throw error;
      }
      
      throw new StorageError('无法按日期范围获取单词');
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Normalize date to string for consistent comparison
   */
  private normalizeDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Normalize date to midnight (00:00:00.000) for consistent date-based storage and lookup.
   * This ensures that word lists saved at any time during a day can be retrieved
   * by any Date object representing that same day.
   */
  private normalizeDateToMidnight(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}

// Export singleton instance
export const storageService = new StorageServiceImpl();

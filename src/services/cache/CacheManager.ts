/**
 * CacheManager - Example Sentence Caching Service
 * 
 * Manages persistent caching of AI-generated example sentences using VocabularyDB.
 * Implements automatic expiration (30-day default) and cache statistics.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6
 */

import { db, type ExampleCacheEntry, type EnhancedExampleSentence } from '../VocabularyDB';

/**
 * Logger utility for cache operations
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
 * Cached examples data structure
 */
export interface CachedExamples {
  word: string;
  examples: EnhancedExampleSentence[];
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

/**
 * CacheManager interface for example sentence caching
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6
 */
export interface CacheManager {
  /**
   * Get cached examples for a word
   * Requirement 7.2: Check cache for existing examples
   * Requirement 7.3: Return cached examples if not expired
   */
  get(word: string): Promise<CachedExamples | null>;
  
  /**
   * Save examples to cache
   * Requirement 7.1: Cache generated examples in local storage
   * Requirement 7.4: Generate new examples when cache is expired
   */
  set(word: string, data: Omit<CachedExamples, 'word' | 'expiresAt'>): Promise<void>;
  
  /**
   * Check if cached data is expired
   * Requirement 7.3: Check if examples are within 30-day window
   */
  isExpired(cached: CachedExamples): boolean;
  
  /**
   * Clear cache for a specific word
   * Requirement 7.6: Provide method to clear cache
   */
  clear(word: string): Promise<void>;
  
  /**
   * Clear all cached examples
   * Requirement 7.6: Provide method to clear cache
   */
  clearAll(): Promise<void>;
  
  /**
   * Get cache statistics
   * Requirement 7.5: Store generation timestamp in cache
   */
  getStats(): Promise<CacheStats>;
}

/**
 * CacheManager implementation using VocabularyDB
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6
 */
export class CacheManagerImpl implements CacheManager {
  private cacheExpirationDays: number;
  
  /**
   * Create a new CacheManager instance
   * 
   * @param cacheExpirationDays - Number of days before cache expires (default: 30)
   */
  constructor(cacheExpirationDays: number = 30) {
    this.cacheExpirationDays = cacheExpirationDays;
  }
  
  /**
   * Get cached examples for a word
   * Requirement 7.2: Retrieve cached examples with expiration check
   * 
   * @param word - The word to retrieve cached examples for
   * @returns Cached examples if found and not expired, null otherwise
   */
  async get(word: string): Promise<CachedExamples | null> {
    try {
      const key = this.getCacheKey(word);
      Logger.info('Retrieving cached examples', { word, key });
      
      // Retrieve from exampleCache table
      const cached = await db.exampleCache.get(key);
      
      if (!cached) {
        Logger.info('No cached examples found', { word });
        return null;
      }
      
      // Convert to CachedExamples format
      const cachedExamples: CachedExamples = {
        word: cached.word,
        examples: cached.examples,
        generatedAt: cached.generatedAt,
        expiresAt: cached.expiresAt,
      };
      
      // Check expiration
      if (this.isExpired(cachedExamples)) {
        Logger.info('Cached examples expired, clearing', { word });
        await this.clear(word);
        return null;
      }
      
      Logger.info('Cached examples retrieved successfully', {
        word,
        count: cached.examples.length,
        generatedAt: cached.generatedAt,
      });
      
      return cachedExamples;
    } catch (error) {
      Logger.error('Failed to get cached examples', {
        word,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
  
  /**
   * Save examples to cache
   * Requirement 7.1: Save examples with automatic expiration date calculation
   * 
   * @param word - The word to cache examples for
   * @param data - The examples data to cache (without word and expiresAt)
   */
  async set(word: string, data: Omit<CachedExamples, 'word' | 'expiresAt'>): Promise<void> {
    try {
      const key = this.getCacheKey(word);
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.cacheExpirationDays);
      
      // Create cache entry
      const cacheEntry: ExampleCacheEntry = {
        id: key,
        word,
        examples: data.examples,
        generatedAt: data.generatedAt,
        expiresAt,
      };
      
      Logger.info('Saving examples to cache', {
        word,
        count: data.examples.length,
        expiresAt: expiresAt.toISOString(),
      });
      
      // Save to exampleCache table
      await db.exampleCache.put(cacheEntry);
      
      Logger.info('Cached examples saved successfully', {
        word,
        count: data.examples.length,
      });
    } catch (error) {
      Logger.error('Failed to save cached examples', {
        word,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - caching failures should not break the application
    }
  }
  
  /**
   * Check if cached data is expired
   * Requirement 7.3: Check cache validity (30-day default)
   * 
   * @param cached - The cached examples to check
   * @returns True if expired, false otherwise
   */
  isExpired(cached: CachedExamples): boolean {
    const now = new Date();
    const expiresAt = new Date(cached.expiresAt);
    const isExpired = now > expiresAt;
    
    if (isExpired) {
      Logger.info('Cache entry is expired', {
        word: cached.word,
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
      });
    }
    
    return isExpired;
  }
  
  /**
   * Clear cache for a specific word
   * Requirement 7.6: Clear method for cache management
   * 
   * @param word - The word to clear cache for
   */
  async clear(word: string): Promise<void> {
    try {
      const key = this.getCacheKey(word);
      Logger.info('Clearing cache for word', { word, key });
      
      await db.exampleCache.delete(key);
      
      Logger.info('Cache cleared for word', { word });
    } catch (error) {
      Logger.error('Failed to clear cache', {
        word,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - cache clearing failures should not break the application
    }
  }
  
  /**
   * Clear all cached examples
   * Requirement 7.6: ClearAll method for cache management
   */
  async clearAll(): Promise<void> {
    try {
      Logger.info('Clearing all example sentence cache');
      
      await db.exampleCache.clear();
      
      Logger.info('All example sentence cache cleared');
    } catch (error) {
      Logger.error('Failed to clear all cache', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - cache clearing failures should not break the application
    }
  }
  
  /**
   * Get cache statistics
   * Requirement 7.6: GetStats method for cache statistics
   * 
   * @returns Cache statistics including entry count, size, and date range
   */
  async getStats(): Promise<CacheStats> {
    try {
      Logger.info('Getting cache statistics');
      
      // Get all cache entries
      const allEntries = await db.exampleCache.toArray();
      
      if (allEntries.length === 0) {
        Logger.info('Cache is empty');
        return {
          totalEntries: 0,
          totalSize: 0,
          oldestEntry: null,
          newestEntry: null,
        };
      }
      
      // Calculate statistics
      const dates = allEntries.map(entry => new Date(entry.generatedAt));
      const sizes = allEntries.map(entry => JSON.stringify(entry).length);
      
      const stats: CacheStats = {
        totalEntries: allEntries.length,
        totalSize: sizes.reduce((sum, size) => sum + size, 0),
        oldestEntry: new Date(Math.min(...dates.map(d => d.getTime()))),
        newestEntry: new Date(Math.max(...dates.map(d => d.getTime()))),
      };
      
      Logger.info('Cache statistics retrieved', stats);
      
      return stats;
    } catch (error) {
      Logger.error('Failed to get cache stats', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }
  
  /**
   * Generate cache key for a word
   * 
   * @param word - The word to generate a key for
   * @returns Cache key (lowercase word)
   */
  private getCacheKey(word: string): string {
    return word.toLowerCase();
  }
}

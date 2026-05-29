/**
 * CacheManager Unit Tests
 * 
 * Tests for the CacheManager implementation including:
 * - Cache retrieval with expiration checks
 * - Cache storage with automatic expiration calculation
 * - Expiration validation
 * - Cache clearing (single and all)
 * - Cache statistics
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.6**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManagerImpl, type CachedExamples } from './CacheManager';
import { db, type EnhancedExampleSentence } from '../VocabularyDB';
import type { ApplicationContext } from '../../types/context';

describe('CacheManager', () => {
  let cacheManager: CacheManagerImpl;

  // Helper function to create mock enhanced example sentences
  const createMockExamples = (word: string, count: number = 3): EnhancedExampleSentence[] => {
    return Array.from({ length: count }, (_, i) => ({
      sentence: `This is example sentence ${i + 1} for ${word}.`,
      translation: `这是${word}的例句${i + 1}。`,
      highlightWord: word,
      context: 'daily-conversation' as ApplicationContext,
      diversityScore: 0.8,
      naturalnessScore: 0.9,
      metadata: {
        generatedAt: new Date(),
        model: 'gpt-3.5-turbo',
        tokensUsed: 100,
      },
    }));
  };

  beforeEach(async () => {
    // Create a new cache manager with default 30-day expiration
    cacheManager = new CacheManagerImpl(30);
    
    // Clear the cache before each test
    await db.exampleCache.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    await db.exampleCache.clear();
  });

  describe('set and get', () => {
    it('should save and retrieve cached examples', async () => {
      // **Validates: Requirement 7.1 - Cache generated examples**
      const word = 'hello';
      const examples = createMockExamples(word);
      const generatedAt = new Date();

      // Save to cache
      await cacheManager.set(word, { examples, generatedAt });

      // Retrieve from cache
      const cached = await cacheManager.get(word);

      expect(cached).not.toBeNull();
      expect(cached?.word).toBe(word);
      expect(cached?.examples).toHaveLength(3);
      expect(cached?.examples[0].sentence).toContain(word);
      expect(cached?.generatedAt).toEqual(generatedAt);
    });

    it('should return null for non-existent cache entry', async () => {
      // **Validates: Requirement 7.2 - Check cache for existing examples**
      const cached = await cacheManager.get('nonexistent');
      expect(cached).toBeNull();
    });

    it('should calculate expiration date correctly', async () => {
      // **Validates: Requirement 7.1 - Automatic expiration date calculation**
      const word = 'test';
      const examples = createMockExamples(word);
      const generatedAt = new Date();

      await cacheManager.set(word, { examples, generatedAt });

      const cached = await cacheManager.get(word);
      expect(cached).not.toBeNull();

      // Check that expiration is 30 days from now
      const expectedExpiration = new Date();
      expectedExpiration.setDate(expectedExpiration.getDate() + 30);

      const expiresAt = new Date(cached!.expiresAt);
      const timeDiff = Math.abs(expiresAt.getTime() - expectedExpiration.getTime());
      
      // Allow 1 second difference for test execution time
      expect(timeDiff).toBeLessThan(1000);
    });

    it('should handle case-insensitive word keys', async () => {
      // Cache with uppercase
      const examples = createMockExamples('Hello');
      await cacheManager.set('Hello', { examples, generatedAt: new Date() });

      // Retrieve with lowercase
      const cached = await cacheManager.get('hello');
      expect(cached).not.toBeNull();
      expect(cached?.word).toBe('Hello');
    });

    it('should overwrite existing cache entry', async () => {
      const word = 'update';
      const oldExamples = createMockExamples(word, 2);
      const newExamples = createMockExamples(word, 5);

      // Save first version
      await cacheManager.set(word, { examples: oldExamples, generatedAt: new Date() });

      // Save second version
      await cacheManager.set(word, { examples: newExamples, generatedAt: new Date() });

      // Retrieve and verify it's the new version
      const cached = await cacheManager.get(word);
      expect(cached?.examples).toHaveLength(5);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired cache', () => {
      // **Validates: Requirement 7.3 - Check cache validity**
      const cached: CachedExamples = {
        word: 'test',
        examples: createMockExamples('test'),
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      };

      expect(cacheManager.isExpired(cached)).toBe(false);
    });

    it('should return true for expired cache', () => {
      // **Validates: Requirement 7.3 - Check cache validity (30-day default)**
      const cached: CachedExamples = {
        word: 'test',
        examples: createMockExamples('test'),
        generatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };

      expect(cacheManager.isExpired(cached)).toBe(true);
    });

    it('should return true for cache expiring exactly now', () => {
      const cached: CachedExamples = {
        word: 'test',
        examples: createMockExamples('test'),
        generatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1), // 1ms ago
      };

      expect(cacheManager.isExpired(cached)).toBe(true);
    });
  });

  describe('get with expiration', () => {
    it('should return null and clear expired cache', async () => {
      // **Validates: Requirement 7.4 - Generate new examples when cache is expired**
      const word = 'expired';
      const examples = createMockExamples(word);

      // Manually insert expired cache entry
      await db.exampleCache.put({
        id: word.toLowerCase(),
        word,
        examples,
        generatedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      // Try to retrieve - should return null and clear
      const cached = await cacheManager.get(word);
      expect(cached).toBeNull();

      // Verify it was cleared from database
      const dbEntry = await db.exampleCache.get(word.toLowerCase());
      expect(dbEntry).toBeUndefined();
    });

    it('should return valid cache within 30-day window', async () => {
      // **Validates: Requirement 7.3 - Return cached examples if not expired**
      const word = 'valid';
      const examples = createMockExamples(word);
      const generatedAt = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000); // 15 days ago

      await cacheManager.set(word, { examples, generatedAt });

      const cached = await cacheManager.get(word);
      expect(cached).not.toBeNull();
      expect(cached?.word).toBe(word);
    });
  });

  describe('clear', () => {
    it('should clear cache for a specific word', async () => {
      // **Validates: Requirement 7.6 - Clear method for cache management**
      const word = 'clear';
      const examples = createMockExamples(word);

      await cacheManager.set(word, { examples, generatedAt: new Date() });

      // Verify it exists
      let cached = await cacheManager.get(word);
      expect(cached).not.toBeNull();

      // Clear it
      await cacheManager.clear(word);

      // Verify it's gone
      cached = await cacheManager.get(word);
      expect(cached).toBeNull();
    });

    it('should not affect other cached words', async () => {
      const word1 = 'keep';
      const word2 = 'remove';
      const examples1 = createMockExamples(word1);
      const examples2 = createMockExamples(word2);

      await cacheManager.set(word1, { examples: examples1, generatedAt: new Date() });
      await cacheManager.set(word2, { examples: examples2, generatedAt: new Date() });

      // Clear only word2
      await cacheManager.clear(word2);

      // Verify word1 still exists
      const cached1 = await cacheManager.get(word1);
      expect(cached1).not.toBeNull();

      // Verify word2 is gone
      const cached2 = await cacheManager.get(word2);
      expect(cached2).toBeNull();
    });

    it('should handle clearing non-existent word gracefully', async () => {
      // Should not throw error
      await expect(cacheManager.clear('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('clearAll', () => {
    it('should clear all cached examples', async () => {
      // **Validates: Requirement 7.6 - ClearAll method for cache management**
      const words = ['word1', 'word2', 'word3'];
      
      // Add multiple cache entries
      for (const word of words) {
        const examples = createMockExamples(word);
        await cacheManager.set(word, { examples, generatedAt: new Date() });
      }

      // Verify they exist
      for (const word of words) {
        const cached = await cacheManager.get(word);
        expect(cached).not.toBeNull();
      }

      // Clear all
      await cacheManager.clearAll();

      // Verify all are gone
      for (const word of words) {
        const cached = await cacheManager.get(word);
        expect(cached).toBeNull();
      }
    });

    it('should handle clearing empty cache gracefully', async () => {
      // Should not throw error
      await expect(cacheManager.clearAll()).resolves.not.toThrow();
    });
  });

  describe('getStats', () => {
    it('should return empty stats for empty cache', async () => {
      // **Validates: Requirement 7.6 - GetStats method for cache statistics**
      const stats = await cacheManager.getStats();

      expect(stats.totalEntries).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.oldestEntry).toBeNull();
      expect(stats.newestEntry).toBeNull();
    });

    it('should return correct stats for single entry', async () => {
      const word = 'stats';
      const examples = createMockExamples(word);
      const generatedAt = new Date();

      await cacheManager.set(word, { examples, generatedAt });

      const stats = await cacheManager.getStats();

      expect(stats.totalEntries).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestEntry).toEqual(generatedAt);
      expect(stats.newestEntry).toEqual(generatedAt);
    });

    it('should return correct stats for multiple entries', async () => {
      const words = ['word1', 'word2', 'word3'];
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-15'),
        new Date('2024-02-01'),
      ];

      // Add entries with different dates
      for (let i = 0; i < words.length; i++) {
        const examples = createMockExamples(words[i]);
        await cacheManager.set(words[i], { examples, generatedAt: dates[i] });
      }

      const stats = await cacheManager.getStats();

      expect(stats.totalEntries).toBe(3);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.oldestEntry).toEqual(dates[0]);
      expect(stats.newestEntry).toEqual(dates[2]);
    });

    it('should calculate total size correctly', async () => {
      const word = 'size';
      const examples = createMockExamples(word, 10); // More examples = larger size

      await cacheManager.set(word, { examples, generatedAt: new Date() });

      const stats = await cacheManager.getStats();

      // Size should be positive and reasonable
      expect(stats.totalSize).toBeGreaterThan(100);
      expect(stats.totalSize).toBeLessThan(100000);
    });
  });

  describe('custom expiration days', () => {
    it('should respect custom expiration period', async () => {
      // **Validates: Requirement 7.3 - Configurable cache expiration**
      const customCacheManager = new CacheManagerImpl(7); // 7 days
      const word = 'custom';
      const examples = createMockExamples(word);
      const generatedAt = new Date();

      await customCacheManager.set(word, { examples, generatedAt });

      const cached = await customCacheManager.get(word);
      expect(cached).not.toBeNull();

      // Check that expiration is 7 days from now
      const expectedExpiration = new Date();
      expectedExpiration.setDate(expectedExpiration.getDate() + 7);

      const expiresAt = new Date(cached!.expiresAt);
      const timeDiff = Math.abs(expiresAt.getTime() - expectedExpiration.getTime());
      
      // Allow 1 second difference for test execution time
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully in get', async () => {
      // Mock database error
      const originalGet = db.exampleCache.get;
      vi.spyOn(db.exampleCache, 'get').mockRejectedValueOnce(new Error('Database error'));

      const cached = await cacheManager.get('error');
      expect(cached).toBeNull();

      // Restore original method
      db.exampleCache.get = originalGet;
    });

    it('should handle database errors gracefully in set', async () => {
      // Mock database error
      const originalPut = db.exampleCache.put;
      vi.spyOn(db.exampleCache, 'put').mockRejectedValueOnce(new Error('Database error'));

      const examples = createMockExamples('error');
      
      // Should not throw
      await expect(
        cacheManager.set('error', { examples, generatedAt: new Date() })
      ).resolves.not.toThrow();

      // Restore original method
      db.exampleCache.put = originalPut;
    });

    it('should handle database errors gracefully in getStats', async () => {
      // Mock database error
      const originalToArray = db.exampleCache.toArray;
      vi.spyOn(db.exampleCache, 'toArray').mockRejectedValueOnce(new Error('Database error'));

      const stats = await cacheManager.getStats();
      
      // Should return empty stats instead of throwing
      expect(stats.totalEntries).toBe(0);
      expect(stats.totalSize).toBe(0);

      // Restore original method
      db.exampleCache.toArray = originalToArray;
    });
  });

  describe('integration with VocabularyDB', () => {
    it('should store examples in exampleCache table', async () => {
      // **Validates: Requirement 7.1 - Use VocabularyDB for storage**
      const word = 'integration';
      const examples = createMockExamples(word);

      await cacheManager.set(word, { examples, generatedAt: new Date() });

      // Verify directly in database
      const dbEntry = await db.exampleCache.get(word.toLowerCase());
      expect(dbEntry).toBeDefined();
      expect(dbEntry?.word).toBe(word);
      expect(dbEntry?.examples).toHaveLength(3);
    });

    it('should retrieve examples from exampleCache table', async () => {
      const word = 'retrieve';
      const examples = createMockExamples(word);
      const generatedAt = new Date();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Insert directly into database
      await db.exampleCache.put({
        id: word.toLowerCase(),
        word,
        examples,
        generatedAt,
        expiresAt,
      });

      // Retrieve via cache manager
      const cached = await cacheManager.get(word);
      expect(cached).not.toBeNull();
      expect(cached?.word).toBe(word);
      expect(cached?.examples).toHaveLength(3);
    });
  });
});

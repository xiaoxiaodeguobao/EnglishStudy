/**
 * StorageService Tests
 * 
 * Tests for the StorageService implementation including unit tests and property-based tests.
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 9.2, 9.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { StorageServiceImpl } from './StorageService';
import { db } from './VocabularyDB';
import type {
  LearningPlan,
  DailyWordList,
  LearningProgress,
  Word,
  WordDefinition,
  ExampleSentence,
} from '../types';

describe('StorageService', () => {
  let storageService: StorageServiceImpl;

  beforeEach(async () => {
    storageService = new StorageServiceImpl();
    // Clear all tables before each test
    await db.learningPlans.clear();
    await db.dailyWordLists.clear();
    await db.words.clear();
    await db.learningProgress.clear();
    localStorage.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    await db.learningPlans.clear();
    await db.dailyWordLists.clear();
    await db.words.clear();
    await db.learningProgress.clear();
    localStorage.clear();
  });

  // ==================== Learning Plan Tests ====================

  describe('Learning Plan Operations', () => {
    it('should save and load a learning plan', async () => {
      // Requirement 10.1
      const plan: LearningPlan = {
        id: 'plan-1',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      await storageService.savePlan(plan);
      const loaded = await storageService.loadPlan('plan-1');

      expect(loaded).toEqual(plan);
    });

    it('should set saved plan as current plan', async () => {
      // Requirement 10.1
      const plan: LearningPlan = {
        id: 'plan-2',
        daysCount: 60,
        wordsPerDay: 15,
        startDate: new Date('2024-02-01'),
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      };

      await storageService.savePlan(plan);
      const currentPlan = await storageService.loadCurrentPlan();

      expect(currentPlan).toEqual(plan);
      expect(localStorage.getItem('currentPlanId')).toBe('plan-2');
    });

    it('should return null when loading non-existent plan', async () => {
      // Requirement 10.1
      const loaded = await storageService.loadPlan('non-existent');
      expect(loaded).toBeNull();
    });

    it('should return null when no current plan exists', async () => {
      // Requirement 10.1
      const currentPlan = await storageService.loadCurrentPlan();
      expect(currentPlan).toBeNull();
    });

    it('should throw StorageError when save fails', async () => {
      // Requirement 12.5
      const plan: LearningPlan = {
        id: 'plan-3',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      // Mock db.learningPlans.put to throw an error
      vi.spyOn(db.learningPlans, 'put').mockRejectedValueOnce(new Error('DB Error'));

      await expect(storageService.savePlan(plan)).rejects.toThrow('无法保存学习计划');
    });
  });

  // ==================== Daily Word List Tests ====================

  describe('Daily Word List Operations', () => {
    const createMockWord = (id: string, word: string): Word => ({
      id,
      word,
      phonetic: '/test/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '测试',
          meaningEN: 'test',
        },
      ],
      examples: [
        {
          sentence: 'This is a test.',
          translation: '这是一个测试。',
          highlightWord: word,
        },
      ],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    });

    it('should save and load a daily word list', async () => {
      // Requirement 10.2
      const wordList: DailyWordList = {
        id: 'list-1',
        date: new Date('2024-01-01'),
        planId: 'plan-1',
        words: [
          createMockWord('word-1', 'test'),
          createMockWord('word-2', 'example'),
        ],
        associations: [],
        sentenceChains: [],
      };

      await storageService.saveDailyWordList(wordList);
      const loaded = await storageService.loadDailyWordList(new Date('2024-01-01'));

      expect(loaded).toEqual(wordList);
    });

    it('should save individual words when saving word list', async () => {
      // Requirement 10.2
      const wordList: DailyWordList = {
        id: 'list-2',
        date: new Date('2024-01-02'),
        planId: 'plan-1',
        words: [
          createMockWord('word-3', 'hello'),
          createMockWord('word-4', 'world'),
        ],
        associations: [],
        sentenceChains: [],
      };

      await storageService.saveDailyWordList(wordList);

      const word1 = await db.words.get('word-3');
      const word2 = await db.words.get('word-4');

      expect(word1).toBeDefined();
      expect(word2).toBeDefined();
      expect(word1?.word).toBe('hello');
      expect(word2?.word).toBe('world');
    });

    it('should load all word lists for a plan', async () => {
      // Requirement 10.2
      const wordList1: DailyWordList = {
        id: 'list-3',
        date: new Date('2024-01-01'),
        planId: 'plan-1',
        words: [createMockWord('word-5', 'apple')],
        associations: [],
        sentenceChains: [],
      };

      const wordList2: DailyWordList = {
        id: 'list-4',
        date: new Date('2024-01-02'),
        planId: 'plan-1',
        words: [createMockWord('word-6', 'banana')],
        associations: [],
        sentenceChains: [],
      };

      const wordList3: DailyWordList = {
        id: 'list-5',
        date: new Date('2024-01-03'),
        planId: 'plan-2',
        words: [createMockWord('word-7', 'cherry')],
        associations: [],
        sentenceChains: [],
      };

      await storageService.saveDailyWordList(wordList1);
      await storageService.saveDailyWordList(wordList2);
      await storageService.saveDailyWordList(wordList3);

      const plan1Lists = await storageService.loadAllWordLists('plan-1');

      expect(plan1Lists).toHaveLength(2);
      expect(plan1Lists.map(l => l.id)).toContain('list-3');
      expect(plan1Lists.map(l => l.id)).toContain('list-4');
      expect(plan1Lists.map(l => l.id)).not.toContain('list-5');
    });

    it('should return null when loading non-existent word list', async () => {
      // Requirement 10.2
      const loaded = await storageService.loadDailyWordList(new Date('2024-01-01'));
      expect(loaded).toBeNull();
    });

    it('should return empty array when loading word lists for non-existent plan', async () => {
      // Requirement 10.2
      const lists = await storageService.loadAllWordLists('non-existent');
      expect(lists).toEqual([]);
    });
  });

  // ==================== Progress Tests ====================

  describe('Progress Operations', () => {
    it('should save and load learning progress', async () => {
      // Requirement 10.3
      const progress: LearningProgress = {
        planId: 'plan-1',
        completedDays: 5,
        totalWords: 50,
        completionPercentage: 16.67,
        remainingDays: 25,
        dailyRecords: [
          {
            date: new Date('2024-01-01'),
            wordListId: 'list-1',
            completed: true,
            completedAt: new Date('2024-01-01T10:00:00'),
          },
        ],
      };

      await storageService.saveProgress(progress);
      const loaded = await storageService.loadProgress('plan-1');

      expect(loaded).toEqual(progress);
    });

    it('should return null when loading non-existent progress', async () => {
      // Requirement 10.3
      const loaded = await storageService.loadProgress('non-existent');
      expect(loaded).toBeNull();
    });

    it('should update existing progress', async () => {
      // Requirement 10.3
      const progress1: LearningProgress = {
        planId: 'plan-1',
        completedDays: 5,
        totalWords: 50,
        completionPercentage: 16.67,
        remainingDays: 25,
        dailyRecords: [],
      };

      const progress2: LearningProgress = {
        planId: 'plan-1',
        completedDays: 10,
        totalWords: 100,
        completionPercentage: 33.33,
        remainingDays: 20,
        dailyRecords: [],
      };

      await storageService.saveProgress(progress1);
      await storageService.saveProgress(progress2);

      const loaded = await storageService.loadProgress('plan-1');

      expect(loaded?.completedDays).toBe(10);
      expect(loaded?.totalWords).toBe(100);
    });
  });

  // ==================== Search and History Tests ====================

  describe('Search and History Operations', () => {
    const createMockWord = (id: string, word: string, generatedAt: Date): Word => ({
      id,
      word,
      phonetic: '/test/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '测试',
          meaningEN: 'test',
        },
      ],
      examples: [
        {
          sentence: 'This is a test.',
          translation: '这是一个测试。',
          highlightWord: word,
        },
      ],
      associations: [],
      generatedAt,
    });

    beforeEach(async () => {
      // Add test words
      await db.words.bulkAdd([
        createMockWord('word-1', 'apple', new Date('2024-01-01')),
        createMockWord('word-2', 'application', new Date('2024-01-02')),
        createMockWord('word-3', 'banana', new Date('2024-01-03')),
        createMockWord('word-4', 'apply', new Date('2024-01-04')),
        createMockWord('word-5', 'cherry', new Date('2024-01-05')),
      ]);
    });

    it('should search words by query (case-insensitive)', async () => {
      // Requirement 9.4
      const results = await storageService.searchWords('app');

      expect(results).toHaveLength(3);
      expect(results.map(w => w.word)).toContain('apple');
      expect(results.map(w => w.word)).toContain('application');
      expect(results.map(w => w.word)).toContain('apply');
    });

    it('should search words case-insensitively', async () => {
      // Requirement 9.4
      const results = await storageService.searchWords('APP');

      expect(results).toHaveLength(3);
      expect(results.map(w => w.word)).toContain('apple');
      expect(results.map(w => w.word)).toContain('application');
      expect(results.map(w => w.word)).toContain('apply');
    });

    it('should return empty array for empty query', async () => {
      // Requirement 9.4
      const results = await storageService.searchWords('');
      expect(results).toEqual([]);
    });

    it('should return empty array when no matches found', async () => {
      // Requirement 9.4
      const results = await storageService.searchWords('xyz');
      expect(results).toEqual([]);
    });

    it('should get words by date range', async () => {
      // Requirement 9.2
      const startDate = new Date('2024-01-02');
      const endDate = new Date('2024-01-04');

      const results = await storageService.getWordsByDateRange(startDate, endDate);

      expect(results).toHaveLength(3);
      expect(results.map(w => w.word)).toContain('application');
      expect(results.map(w => w.word)).toContain('banana');
      expect(results.map(w => w.word)).toContain('apply');
    });

    it('should include boundary dates in date range query', async () => {
      // Requirement 9.2
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');

      const results = await storageService.getWordsByDateRange(startDate, endDate);

      expect(results).toHaveLength(5);
    });

    it('should throw error when start date is after end date', async () => {
      // Requirement 9.2
      const startDate = new Date('2024-01-05');
      const endDate = new Date('2024-01-01');

      await expect(
        storageService.getWordsByDateRange(startDate, endDate)
      ).rejects.toThrow('开始日期不能晚于结束日期');
    });

    it('should return empty array when no words in date range', async () => {
      // Requirement 9.2
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-28');

      const results = await storageService.getWordsByDateRange(startDate, endDate);

      expect(results).toEqual([]);
    });
  });

  // ==================== Property-Based Tests ====================

  describe('Property 3: Data Persistence Round-trip Consistency', () => {
    it('should maintain data consistency for learning plans', async () => {
      // **Validates: Requirements 1.6, 10.1, 10.2, 10.3, 10.4, 10.5**
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            daysCount: fc.integer({ min: 1, max: 365 }),
            wordsPerDay: fc.integer({ min: 1, max: 100 }),
            startDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          }),
          async (planData) => {
            const plan: LearningPlan = planData;

            await storageService.savePlan(plan);
            const loaded = await storageService.loadPlan(plan.id);

            expect(loaded).toEqual(plan);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain data consistency for learning progress', async () => {
      // **Validates: Requirements 1.6, 10.1, 10.2, 10.3, 10.4, 10.5**
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            planId: fc.string({ minLength: 1, maxLength: 50 }),
            completedDays: fc.integer({ min: 0, max: 365 }),
            totalWords: fc.integer({ min: 0, max: 36500 }),
            completionPercentage: fc.float({ min: 0, max: 100 }),
            remainingDays: fc.integer({ min: 0, max: 365 }),
            dailyRecords: fc.array(
              fc.record({
                date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
                wordListId: fc.string({ minLength: 1, maxLength: 50 }),
                completed: fc.boolean(),
                completedAt: fc.option(
                  fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
                  { nil: undefined }
                ),
              }),
              { maxLength: 10 }
            ),
          }),
          async (progressData) => {
            const progress: LearningProgress = progressData;

            await storageService.saveProgress(progress);
            const loaded = await storageService.loadProgress(progress.planId);

            expect(loaded).toEqual(progress);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 19: Date Filtering Correctness', () => {
    it('should only return words within the specified date range', async () => {
      // **Validates: Requirements 9.2**
      await fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              word: fc.string({ minLength: 1, maxLength: 20 }),
              generatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            }),
            { 
              minLength: 5, 
              maxLength: 20,
              selector: (item) => item.id // Ensure unique IDs
            }
          ),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2029-12-31') }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2029-12-31') }),
          async (wordsData, date1, date2) => {
            // Clear database
            await db.words.clear();

            // Ensure startDate <= endDate
            const startDate = date1 <= date2 ? date1 : date2;
            const endDate = date1 <= date2 ? date2 : date1;

            // Add words to database
            const words: Word[] = wordsData.map(w => ({
              id: w.id,
              word: w.word,
              phonetic: '/test/',
              definitions: [
                {
                  partOfSpeech: 'noun',
                  meaningCN: '测试',
                  meaningEN: 'test',
                },
              ],
              examples: [
                {
                  sentence: 'Test sentence.',
                  translation: '测试句子。',
                  highlightWord: w.word,
                },
              ],
              associations: [],
              generatedAt: w.generatedAt,
            }));

            await db.words.bulkAdd(words);

            // Query by date range
            const results = await storageService.getWordsByDateRange(startDate, endDate);

            // Verify all results are within the date range
            for (const word of results) {
              expect(word.generatedAt.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
              expect(word.generatedAt.getTime()).toBeLessThanOrEqual(endDate.getTime());
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 21: Search Result Relevance', () => {
    it('should only return words containing the search keyword', async () => {
      // **Validates: Requirements 9.4**
      await fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              word: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { 
              minLength: 5, 
              maxLength: 20,
              selector: (item) => item.id // Ensure unique IDs
            }
          ),
          fc.string({ minLength: 1, maxLength: 10 }),
          async (wordsData, searchQuery) => {
            // Clear database
            await db.words.clear();

            // Add words to database
            const words: Word[] = wordsData.map(w => ({
              id: w.id,
              word: w.word,
              phonetic: '/test/',
              definitions: [
                {
                  partOfSpeech: 'noun',
                  meaningCN: '测试',
                  meaningEN: 'test',
                },
              ],
              examples: [
                {
                  sentence: 'Test sentence.',
                  translation: '测试句子。',
                  highlightWord: w.word,
                },
              ],
              associations: [],
              generatedAt: new Date(),
            }));

            await db.words.bulkAdd(words);

            // Search
            const results = await storageService.searchWords(searchQuery);

            // Verify all results contain the search query (case-insensitive)
            const lowerQuery = searchQuery.toLowerCase();
            for (const word of results) {
              expect(word.word.toLowerCase()).toContain(lowerQuery);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

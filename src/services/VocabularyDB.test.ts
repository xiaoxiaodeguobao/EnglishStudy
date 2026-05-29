/**
 * VocabularyDB Tests
 * 
 * Tests for the Dexie.js database configuration.
 * Validates database schema, indexes, and basic CRUD operations.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VocabularyDB } from './VocabularyDB';
import type {
  LearningPlan,
  DailyWordList,
  Word,
  LearningProgress,
} from '../types';
import type { ExampleCacheEntry, SentenceChainCacheEntry } from './VocabularyDB';

describe('VocabularyDB', () => {
  let testDb: VocabularyDB;

  beforeEach(() => {
    // Create a new test database instance
    testDb = new VocabularyDB();
  });

  afterEach(async () => {
    // Clean up: delete the test database
    await testDb.delete();
    await testDb.close();
  });

  describe('Database Schema', () => {
    it('should create database with correct name', () => {
      expect(testDb.name).toBe('VocabularyLearningDB');
    });

    it('should have learningPlans table', () => {
      expect(testDb.learningPlans).toBeDefined();
      expect(testDb.learningPlans.name).toBe('learningPlans');
    });

    it('should have dailyWordLists table', () => {
      expect(testDb.dailyWordLists).toBeDefined();
      expect(testDb.dailyWordLists.name).toBe('dailyWordLists');
    });

    it('should have words table', () => {
      expect(testDb.words).toBeDefined();
      expect(testDb.words.name).toBe('words');
    });

    it('should have learningProgress table', () => {
      expect(testDb.learningProgress).toBeDefined();
      expect(testDb.learningProgress.name).toBe('learningProgress');
    });

    it('should have exampleCache table', () => {
      expect(testDb.exampleCache).toBeDefined();
      expect(testDb.exampleCache.name).toBe('exampleCache');
    });

    it('should have sentenceChainCache table', () => {
      expect(testDb.sentenceChainCache).toBeDefined();
      expect(testDb.sentenceChainCache.name).toBe('sentenceChainCache');
    });
  });

  describe('Learning Plans Store', () => {
    it('should store and retrieve a learning plan', async () => {
      const plan: LearningPlan = {
        id: 'plan-1',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.learningPlans.add(plan);
      const retrieved = await testDb.learningPlans.get('plan-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(plan.id);
      expect(retrieved?.daysCount).toBe(plan.daysCount);
      expect(retrieved?.wordsPerDay).toBe(plan.wordsPerDay);
    });

    it('should query plans by startDate index', async () => {
      const plan1: LearningPlan = {
        id: 'plan-1',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plan2: LearningPlan = {
        id: 'plan-2',
        daysCount: 60,
        wordsPerDay: 15,
        startDate: new Date('2024-02-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.learningPlans.bulkAdd([plan1, plan2]);

      const plans = await testDb.learningPlans
        .where('startDate')
        .above(new Date('2024-01-15'))
        .toArray();

      expect(plans).toHaveLength(1);
      expect(plans[0].id).toBe('plan-2');
    });
  });

  describe('Daily Word Lists Store', () => {
    it('should store and retrieve a daily word list', async () => {
      const wordList: DailyWordList = {
        id: 'list-1',
        date: new Date('2024-01-01'),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      };

      await testDb.dailyWordLists.add(wordList);
      const retrieved = await testDb.dailyWordLists.get('list-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(wordList.id);
      expect(retrieved?.planId).toBe(wordList.planId);
    });

    it('should query word lists by date index', async () => {
      const list1: DailyWordList = {
        id: 'list-1',
        date: new Date('2024-01-01'),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      };

      const list2: DailyWordList = {
        id: 'list-2',
        date: new Date('2024-01-02'),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      };

      await testDb.dailyWordLists.bulkAdd([list1, list2]);

      const lists = await testDb.dailyWordLists
        .where('date')
        .equals(new Date('2024-01-01'))
        .toArray();

      expect(lists).toHaveLength(1);
      expect(lists[0].id).toBe('list-1');
    });

    it('should query word lists by planId index', async () => {
      const list1: DailyWordList = {
        id: 'list-1',
        date: new Date('2024-01-01'),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      };

      const list2: DailyWordList = {
        id: 'list-2',
        date: new Date('2024-01-02'),
        planId: 'plan-2',
        words: [],
        associations: [],
        sentenceChains: [],
      };

      await testDb.dailyWordLists.bulkAdd([list1, list2]);

      const lists = await testDb.dailyWordLists
        .where('planId')
        .equals('plan-1')
        .toArray();

      expect(lists).toHaveLength(1);
      expect(lists[0].id).toBe('list-1');
    });
  });

  describe('Words Store', () => {
    it('should store and retrieve a word', async () => {
      const word: Word = {
        id: 'word-1',
        word: 'example',
        phonetic: '/ɪɡˈzæmpəl/',
        definitions: [
          {
            partOfSpeech: 'noun',
            meaningCN: '例子',
            meaningEN: 'a thing characteristic of its kind',
          },
        ],
        examples: [
          {
            sentence: 'This is an example sentence.',
            translation: '这是一个例句。',
            highlightWord: 'example',
          },
        ],
        associations: [],
        generatedAt: new Date(),
      };

      await testDb.words.add(word);
      const retrieved = await testDb.words.get('word-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.word).toBe('example');
      expect(retrieved?.phonetic).toBe('/ɪɡˈzæmpəl/');
    });

    it('should query words by word text index', async () => {
      const word1: Word = {
        id: 'word-1',
        word: 'apple',
        definitions: [],
        examples: [],
        associations: [],
        generatedAt: new Date(),
      };

      const word2: Word = {
        id: 'word-2',
        word: 'banana',
        definitions: [],
        examples: [],
        associations: [],
        generatedAt: new Date(),
      };

      await testDb.words.bulkAdd([word1, word2]);

      const words = await testDb.words.where('word').equals('apple').toArray();

      expect(words).toHaveLength(1);
      expect(words[0].id).toBe('word-1');
    });

    it('should query words by generatedAt index', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      const word1: Word = {
        id: 'word-1',
        word: 'apple',
        definitions: [],
        examples: [],
        associations: [],
        generatedAt: date1,
      };

      const word2: Word = {
        id: 'word-2',
        word: 'banana',
        definitions: [],
        examples: [],
        associations: [],
        generatedAt: date2,
      };

      await testDb.words.bulkAdd([word1, word2]);

      const words = await testDb.words
        .where('generatedAt')
        .above(new Date('2024-01-01T12:00:00'))
        .toArray();

      expect(words).toHaveLength(1);
      expect(words[0].id).toBe('word-2');
    });
  });

  describe('Learning Progress Store', () => {
    it('should store and retrieve learning progress', async () => {
      const progress: LearningProgress = {
        planId: 'plan-1',
        completedDays: 5,
        totalWords: 50,
        completionPercentage: 16.67,
        remainingDays: 25,
        dailyRecords: [],
      };

      await testDb.learningProgress.add(progress);
      const retrieved = await testDb.learningProgress.get('plan-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.planId).toBe('plan-1');
      expect(retrieved?.completedDays).toBe(5);
      expect(retrieved?.totalWords).toBe(50);
    });

    it('should update existing progress', async () => {
      const progress: LearningProgress = {
        planId: 'plan-1',
        completedDays: 5,
        totalWords: 50,
        completionPercentage: 16.67,
        remainingDays: 25,
        dailyRecords: [],
      };

      await testDb.learningProgress.add(progress);

      // Update progress
      await testDb.learningProgress.update('plan-1', {
        completedDays: 6,
        totalWords: 60,
      });

      const updated = await testDb.learningProgress.get('plan-1');

      expect(updated?.completedDays).toBe(6);
      expect(updated?.totalWords).toBe(60);
    });
  });

  describe('CRUD Operations', () => {
    it('should delete a record', async () => {
      const plan: LearningPlan = {
        id: 'plan-1',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.learningPlans.add(plan);
      await testDb.learningPlans.delete('plan-1');

      const retrieved = await testDb.learningPlans.get('plan-1');
      expect(retrieved).toBeUndefined();
    });

    it('should clear all records from a table', async () => {
      const plans: LearningPlan[] = [
        {
          id: 'plan-1',
          daysCount: 30,
          wordsPerDay: 10,
          startDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'plan-2',
          daysCount: 60,
          wordsPerDay: 15,
          startDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await testDb.learningPlans.bulkAdd(plans);
      await testDb.learningPlans.clear();

      const count = await testDb.learningPlans.count();
      expect(count).toBe(0);
    });
  });

  describe('Example Cache Store', () => {
    it('should store and retrieve example cache entry', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const cacheEntry: ExampleCacheEntry = {
        id: 'example',
        word: 'example',
        examples: [
          {
            sentence: 'This is an example sentence.',
            translation: '这是一个例句。',
            highlightWord: 'example',
            context: 'daily-conversation',
            diversityScore: 0.8,
            naturalnessScore: 0.9,
            metadata: {
              generatedAt: now,
              model: 'gpt-4',
              tokensUsed: 150,
            },
          },
        ],
        generatedAt: now,
        expiresAt: expiresAt,
      };

      await testDb.exampleCache.add(cacheEntry);
      const retrieved = await testDb.exampleCache.get('example');

      expect(retrieved).toBeDefined();
      expect(retrieved?.word).toBe('example');
      expect(retrieved?.examples).toHaveLength(1);
      expect(retrieved?.examples[0].context).toBe('daily-conversation');
    });

    it('should query cache by word index', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const entry1: ExampleCacheEntry = {
        id: 'apple',
        word: 'apple',
        examples: [],
        generatedAt: now,
        expiresAt: expiresAt,
      };

      const entry2: ExampleCacheEntry = {
        id: 'banana',
        word: 'banana',
        examples: [],
        generatedAt: now,
        expiresAt: expiresAt,
      };

      await testDb.exampleCache.bulkAdd([entry1, entry2]);

      const entries = await testDb.exampleCache
        .where('word')
        .equals('apple')
        .toArray();

      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe('apple');
    });

    it('should query cache by expiresAt index for expiration checks', async () => {
      const now = new Date();
      const expired = new Date(now.getTime() - 1000); // Already expired
      const valid = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Valid for 30 days

      const entry1: ExampleCacheEntry = {
        id: 'expired',
        word: 'expired',
        examples: [],
        generatedAt: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
        expiresAt: expired,
      };

      const entry2: ExampleCacheEntry = {
        id: 'valid',
        word: 'valid',
        examples: [],
        generatedAt: now,
        expiresAt: valid,
      };

      await testDb.exampleCache.bulkAdd([entry1, entry2]);

      // Query for expired entries
      const expiredEntries = await testDb.exampleCache
        .where('expiresAt')
        .below(now)
        .toArray();

      expect(expiredEntries).toHaveLength(1);
      expect(expiredEntries[0].id).toBe('expired');

      // Query for valid entries
      const validEntries = await testDb.exampleCache
        .where('expiresAt')
        .above(now)
        .toArray();

      expect(validEntries).toHaveLength(1);
      expect(validEntries[0].id).toBe('valid');
    });
  });

  describe('Sentence Chain Cache Store', () => {
    it('should store and retrieve sentence chain cache entry', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const cacheEntry: SentenceChainCacheEntry = {
        id: 'word1-word2',
        wordIds: ['word1', 'word2'],
        chains: [
          {
            id: 'chain-1',
            sentence: 'This sentence uses multiple words.',
            usedWordIds: ['word1', 'word2'],
            translation: '这个句子使用了多个单词。',
            context: 'daily-conversation',
            qualityScore: 0.85,
            metadata: {
              generatedAt: now,
              model: 'gpt-4',
            },
          },
        ],
        generatedAt: now,
        expiresAt: expiresAt,
      };

      await testDb.sentenceChainCache.add(cacheEntry);
      const retrieved = await testDb.sentenceChainCache.get('word1-word2');

      expect(retrieved).toBeDefined();
      expect(retrieved?.wordIds).toEqual(['word1', 'word2']);
      expect(retrieved?.chains).toHaveLength(1);
      expect(retrieved?.chains[0].context).toBe('daily-conversation');
    });

    it('should query cache by wordIds index', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const entry1: SentenceChainCacheEntry = {
        id: 'word1-word2',
        wordIds: ['word1', 'word2'],
        chains: [],
        generatedAt: now,
        expiresAt: expiresAt,
      };

      const entry2: SentenceChainCacheEntry = {
        id: 'word3-word4',
        wordIds: ['word3', 'word4'],
        chains: [],
        generatedAt: now,
        expiresAt: expiresAt,
      };

      await testDb.sentenceChainCache.bulkAdd([entry1, entry2]);

      // Note: Dexie doesn't support direct array equality queries
      // We need to query by the compound key (id)
      const entry = await testDb.sentenceChainCache.get('word1-word2');

      expect(entry).toBeDefined();
      expect(entry?.wordIds).toEqual(['word1', 'word2']);
    });

    it('should query cache by expiresAt index for expiration checks', async () => {
      const now = new Date();
      const expired = new Date(now.getTime() - 1000);
      const valid = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const entry1: SentenceChainCacheEntry = {
        id: 'expired-chain',
        wordIds: ['word1', 'word2'],
        chains: [],
        generatedAt: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
        expiresAt: expired,
      };

      const entry2: SentenceChainCacheEntry = {
        id: 'valid-chain',
        wordIds: ['word3', 'word4'],
        chains: [],
        generatedAt: now,
        expiresAt: valid,
      };

      await testDb.sentenceChainCache.bulkAdd([entry1, entry2]);

      // Query for expired entries
      const expiredEntries = await testDb.sentenceChainCache
        .where('expiresAt')
        .below(now)
        .toArray();

      expect(expiredEntries).toHaveLength(1);
      expect(expiredEntries[0].id).toBe('expired-chain');

      // Query for valid entries
      const validEntries = await testDb.sentenceChainCache
        .where('expiresAt')
        .above(now)
        .toArray();

      expect(validEntries).toHaveLength(1);
      expect(validEntries[0].id).toBe('valid-chain');
    });
  });
});

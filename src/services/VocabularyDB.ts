/**
 * VocabularyDB - Dexie.js Database Configuration
 * 
 * This module configures the IndexedDB database using Dexie.js for data persistence.
 * It defines the database schema with six object stores:
 * - learningPlans: Stores user learning plans
 * - dailyWordLists: Stores daily generated word lists
 * - words: Stores individual words with definitions and examples
 * - learningProgress: Stores user learning progress
 * - exampleCache: Stores cached AI-generated example sentences
 * - sentenceChainCache: Stores cached AI-generated sentence chains
 * 
 * Requirements: 10.1, 10.3, 7.1, 7.5
 */

import Dexie, { Table } from 'dexie';
import type {
  LearningPlan,
  DailyWordList,
  Word,
  LearningProgress,
  ExampleSentence,
} from '../types';
import type { ApplicationContext } from '../types/context';

/**
 * Enhanced example sentence with context and quality metrics
 * Used for caching AI-generated examples
 */
export interface EnhancedExampleSentence extends ExampleSentence {
  context: ApplicationContext;
  diversityScore?: number;
  naturalnessScore?: number;
  metadata: {
    generatedAt: Date;
    model: string;
    tokensUsed: number;
  };
}

/**
 * Cache entry for example sentences
 * Stores generated examples with 30-day expiration
 */
export interface ExampleCacheEntry {
  id: string; // word
  word: string;
  examples: EnhancedExampleSentence[];
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * Enhanced sentence chain with context and quality metrics
 * Used for caching AI-generated sentence chains
 */
export interface EnhancedSentenceChain {
  id: string;
  sentence: string;
  usedWordIds: string[];
  translation: string;
  context: ApplicationContext;
  qualityScore: number;
  metadata: {
    generatedAt: Date;
    model: string;
  };
}

/**
 * Cache entry for sentence chains
 * Stores generated chains with 30-day expiration
 */
export interface SentenceChainCacheEntry {
  id: string; // combination of word IDs
  wordIds: string[];
  chains: EnhancedSentenceChain[];
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * VocabularyDB class extends Dexie to provide typed access to IndexedDB
 */
export class VocabularyDB extends Dexie {
  // Typed table declarations
  learningPlans!: Table<LearningPlan, string>;
  dailyWordLists!: Table<DailyWordList, string>;
  words!: Table<Word, string>;
  learningProgress!: Table<LearningProgress, string>;
  exampleCache!: Table<ExampleCacheEntry, string>;
  sentenceChainCache!: Table<SentenceChainCacheEntry, string>;

  constructor() {
    super('VocabularyLearningDB');

    // Define database schema version 1
    this.version(1).stores({
      // Learning Plans store
      // Primary key: id
      // Indexes: startDate (for querying plans by start date)
      learningPlans: 'id, startDate',

      // Daily Word Lists store
      // Primary key: id
      // Indexes: date (for querying by date), planId (for querying by plan)
      dailyWordLists: 'id, date, planId',

      // Words store
      // Primary key: id
      // Indexes: word (for searching by word text), generatedAt (for querying by generation time)
      words: 'id, word, generatedAt',

      // Learning Progress store
      // Primary key: planId (one progress record per plan)
      learningProgress: 'planId',
    });

    // Define database schema version 2 - Add caching tables
    this.version(2).stores({
      // Existing stores (must be redeclared for migration)
      learningPlans: 'id, startDate',
      dailyWordLists: 'id, date, planId',
      words: 'id, word, generatedAt',
      learningProgress: 'planId',

      // Example Cache store
      // Primary key: id (word)
      // Indexes: word (for searching), generatedAt (for cache management), expiresAt (for expiration checks)
      exampleCache: 'id, word, generatedAt, expiresAt',

      // Sentence Chain Cache store
      // Primary key: id (combination of word IDs)
      // Indexes: wordIds (for searching by word combinations), generatedAt (for cache management), expiresAt (for expiration checks)
      sentenceChainCache: 'id, wordIds, generatedAt, expiresAt',
    });
  }
}

// Export singleton instance
export const db = new VocabularyDB();

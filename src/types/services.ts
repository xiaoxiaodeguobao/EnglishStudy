/**
 * Service Layer Interfaces
 * 
 * Defines the interfaces for all service layer components.
 * Requirements: 1.1, 3.1, 6.1, 7.1, 8.1
 */

import { LearningPlan } from './learningPlan';
import { Word, WordDefinition, ExampleSentence } from './word';
import { DailyWordList, SentenceChain } from './wordList';
import { LearningProgress, DailyRecord } from './progress';

/**
 * Learning Plan Service Interface
 * Manages creation, updating, and retrieval of learning plans.
 */
export interface LearningPlanService {
  createPlan(daysCount: number, wordsPerDay: number): Promise<LearningPlan>;
  updatePlan(id: string, updates: Partial<LearningPlan>): Promise<LearningPlan>;
  getCurrentPlan(): Promise<LearningPlan | null>;
  deletePlan(id: string): Promise<void>;
}

/**
 * Word Generator Service Interface
 * Generates daily word lists with associations and sentence chains.
 */
export interface WordGeneratorService {
  generateDailyWords(planId: string, date: Date, count: number): Promise<DailyWordList>;
  validateAssociations(words: Word[]): Promise<boolean>;
  getUsedWords(planId: string): Promise<string[]>;
}

/**
 * Dictionary Service Interface
 * Provides word definitions, phonetics, and search functionality.
 */
export interface DictionaryService {
  getWordDefinitions(word: string): Promise<WordDefinition[]>;
  getPhonetic(word: string): Promise<string | undefined>;
  searchWord(query: string): Promise<Word[]>;
}

/**
 * Example Sentence Service Interface
 * Provides example sentences for words.
 */
export interface ExampleSentenceService {
  getExamples(word: string, count: number): Promise<ExampleSentence[]>;
  validateExamples(examples: ExampleSentence[]): boolean;
}

/**
 * Progress Service Interface
 * Tracks and manages learning progress.
 */
export interface ProgressService {
  getProgress(planId: string): Promise<LearningProgress>;
  markDayComplete(planId: string, date: Date): Promise<void>;
  getDailyRecord(planId: string, date: Date): Promise<DailyRecord | null>;
}

/**
 * Storage Service Interface
 * Handles data persistence using IndexedDB and LocalStorage.
 */
export interface StorageService {
  // Learning Plan operations
  savePlan(plan: LearningPlan): Promise<void>;
  loadPlan(id: string): Promise<LearningPlan | null>;
  loadCurrentPlan(): Promise<LearningPlan | null>;
  
  // Daily Word List operations
  saveDailyWordList(wordList: DailyWordList): Promise<void>;
  loadDailyWordList(date: Date): Promise<DailyWordList | null>;
  loadAllWordLists(planId: string): Promise<DailyWordList[]>;
  
  // Progress operations
  saveProgress(progress: LearningProgress): Promise<void>;
  loadProgress(planId: string): Promise<LearningProgress | null>;
  
  // History and search operations
  searchWords(query: string): Promise<Word[]>;
  getWordsByDateRange(startDate: Date, endDate: Date): Promise<Word[]>;
}

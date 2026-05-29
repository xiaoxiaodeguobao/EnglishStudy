/**
 * Type Definitions Tests
 * 
 * Verifies that all type definitions are properly exported and can be imported.
 * Requirements: 1.1, 1.2, 3.1, 6.1, 7.1, 8.1
 */

import { describe, it, expect } from 'vitest';
import type {
  LearningPlan,
  LearningPlanValidation,
  Word,
  WordDefinition,
  ExampleSentence,
  DailyWordList,
  WordAssociation,
  SentenceChain,
  AssociationType,
  LearningProgress,
  DailyRecord,
  ErrorLog,
  ErrorType,
  ErrorSeverity,
  ErrorContext,
  LearningPlanService,
  WordGeneratorService,
  DictionaryService,
  ExampleSentenceService,
  ProgressService,
  StorageService,
} from './index';

import {
  StorageError,
  ValidationError,
  NetworkError,
  GenerationError,
} from './index';

describe('Type Definitions', () => {
  describe('LearningPlan types', () => {
    it('should allow creating a valid LearningPlan object', () => {
      const plan: LearningPlan = {
        id: 'plan-1',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(plan.id).toBe('plan-1');
      expect(plan.daysCount).toBe(30);
      expect(plan.wordsPerDay).toBe(10);
    });

    it('should allow creating a LearningPlanValidation object', () => {
      const validation: LearningPlanValidation = {
        valid: true,
        errors: [],
      };

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe('Word types', () => {
    it('should allow creating a valid Word object', () => {
      const word: Word = {
        id: 'word-1',
        word: 'hello',
        phonetic: '/həˈloʊ/',
        definitions: [],
        examples: [],
        associations: [],
        generatedAt: new Date(),
      };

      expect(word.word).toBe('hello');
      expect(word.phonetic).toBe('/həˈloʊ/');
    });

    it('should allow creating a WordDefinition object', () => {
      const definition: WordDefinition = {
        partOfSpeech: 'noun',
        meaningCN: '你好',
        meaningEN: 'a greeting',
      };

      expect(definition.partOfSpeech).toBe('noun');
      expect(definition.meaningCN).toBe('你好');
    });

    it('should allow creating an ExampleSentence object', () => {
      const example: ExampleSentence = {
        sentence: 'Hello, world!',
        translation: '你好，世界！',
        highlightWord: 'Hello',
      };

      expect(example.sentence).toBe('Hello, world!');
      expect(example.translation).toBe('你好，世界！');
    });
  });

  describe('WordList types', () => {
    it('should allow creating a DailyWordList object', () => {
      const wordList: DailyWordList = {
        id: 'list-1',
        date: new Date(),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      };

      expect(wordList.id).toBe('list-1');
      expect(wordList.planId).toBe('plan-1');
    });

    it('should allow creating a WordAssociation object', () => {
      const association: WordAssociation = {
        word1Id: 'word-1',
        word2Id: 'word-2',
        associationType: 'semantic',
        description: 'Related by meaning',
      };

      expect(association.associationType).toBe('semantic');
    });

    it('should enforce AssociationType values', () => {
      const types: AssociationType[] = ['theme', 'semantic', 'root', 'context'];
      expect(types).toHaveLength(4);
    });

    it('should allow creating a SentenceChain object', () => {
      const chain: SentenceChain = {
        id: 'chain-1',
        sentence: 'This is a test sentence.',
        usedWordIds: ['word-1', 'word-2'],
        translation: '这是一个测试句子。',
      };

      expect(chain.usedWordIds).toHaveLength(2);
    });
  });

  describe('Progress types', () => {
    it('should allow creating a LearningProgress object', () => {
      const progress: LearningProgress = {
        planId: 'plan-1',
        completedDays: 5,
        totalWords: 50,
        completionPercentage: 16.67,
        remainingDays: 25,
        dailyRecords: [],
      };

      expect(progress.completedDays).toBe(5);
      expect(progress.totalWords).toBe(50);
    });

    it('should allow creating a DailyRecord object', () => {
      const record: DailyRecord = {
        date: new Date(),
        wordListId: 'list-1',
        completed: true,
        completedAt: new Date(),
      };

      expect(record.completed).toBe(true);
      expect(record.completedAt).toBeDefined();
    });
  });

  describe('Error types', () => {
    it('should allow creating an ErrorLog object', () => {
      const errorLog: ErrorLog = {
        id: 'error-1',
        timestamp: new Date(),
        errorType: 'network',
        severity: 'high',
        message: 'Network request failed',
        context: {
          action: 'fetchWords',
        },
      };

      expect(errorLog.errorType).toBe('network');
      expect(errorLog.severity).toBe('high');
    });

    it('should enforce ErrorType values', () => {
      const types: ErrorType[] = [
        'network',
        'validation',
        'storage',
        'generation',
        'data_integrity',
      ];
      expect(types).toHaveLength(5);
    });

    it('should enforce ErrorSeverity values', () => {
      const severities: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];
      expect(severities).toHaveLength(4);
    });

    it('should allow creating custom error classes', () => {
      const storageError = new StorageError('Storage failed');
      expect(storageError).toBeInstanceOf(Error);
      expect(storageError.name).toBe('StorageError');

      const validationError = new ValidationError('Validation failed');
      expect(validationError).toBeInstanceOf(Error);
      expect(validationError.name).toBe('ValidationError');

      const networkError = new NetworkError('Network failed');
      expect(networkError).toBeInstanceOf(Error);
      expect(networkError.name).toBe('NetworkError');

      const generationError = new GenerationError('Generation failed');
      expect(generationError).toBeInstanceOf(Error);
      expect(generationError.name).toBe('GenerationError');
    });
  });

  describe('Service interfaces', () => {
    it('should define LearningPlanService interface', () => {
      // This is a compile-time check - if the interface is not properly defined,
      // TypeScript will fail to compile
      const mockService: LearningPlanService = {
        createPlan: async () => ({
          id: 'plan-1',
          daysCount: 30,
          wordsPerDay: 10,
          startDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updatePlan: async () => ({
          id: 'plan-1',
          daysCount: 30,
          wordsPerDay: 10,
          startDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        getCurrentPlan: async () => null,
        deletePlan: async () => {},
      };

      expect(mockService).toBeDefined();
    });

    it('should define WordGeneratorService interface', () => {
      const mockService: WordGeneratorService = {
        generateDailyWords: async () => ({
          id: 'list-1',
          date: new Date(),
          planId: 'plan-1',
          words: [],
          associations: [],
          sentenceChains: [],
        }),
        validateAssociations: async () => true,
        getUsedWords: async () => [],
      };

      expect(mockService).toBeDefined();
    });

    it('should define DictionaryService interface', () => {
      const mockService: DictionaryService = {
        getWordDefinitions: async () => [],
        getPhonetic: async () => undefined,
        searchWord: async () => [],
      };

      expect(mockService).toBeDefined();
    });

    it('should define ExampleSentenceService interface', () => {
      const mockService: ExampleSentenceService = {
        getExamples: async () => [],
        validateExamples: () => true,
      };

      expect(mockService).toBeDefined();
    });

    it('should define ProgressService interface', () => {
      const mockService: ProgressService = {
        getProgress: async () => ({
          planId: 'plan-1',
          completedDays: 0,
          totalWords: 0,
          completionPercentage: 0,
          remainingDays: 30,
          dailyRecords: [],
        }),
        markDayComplete: async () => {},
        getDailyRecord: async () => null,
      };

      expect(mockService).toBeDefined();
    });

    it('should define StorageService interface', () => {
      const mockService: StorageService = {
        savePlan: async () => {},
        loadPlan: async () => null,
        loadCurrentPlan: async () => null,
        saveDailyWordList: async () => {},
        loadDailyWordList: async () => null,
        loadAllWordLists: async () => [],
        saveProgress: async () => {},
        loadProgress: async () => null,
        searchWords: async () => [],
        getWordsByDateRange: async () => [],
      };

      expect(mockService).toBeDefined();
    });
  });
});

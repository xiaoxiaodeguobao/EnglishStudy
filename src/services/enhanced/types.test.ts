/**
 * Enhanced Service Types Tests
 * 
 * Tests for type definitions and interface contracts.
 * Validates: Requirements 1.4, 2.3, 4.6, 9.6
 */

import { describe, it, expect } from 'vitest';
import type {
  EnhancedExampleSentence,
  ExampleGenerationOptions,
  ExampleGenerationResult,
  EnhancedExampleSentenceService,
  EnhancedSentenceChain,
  SentenceChainGenerationOptions,
  SentenceChainService,
} from './types';

describe('Enhanced Service Types', () => {
  describe('EnhancedExampleSentence', () => {
    it('should extend ExampleSentence with additional fields', () => {
      // Requirement 1.4: Context field
      // Requirement 2.3: Diversity score field
      // Requirement 9.6: Quality scores and metadata
      const enhancedExample: EnhancedExampleSentence = {
        sentence: 'The quick brown fox jumps over the lazy dog.',
        translation: '敏捷的棕色狐狸跳过懒狗。',
        highlightWord: 'quick',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.92,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-3.5-turbo',
          tokensUsed: 150,
        },
      };

      expect(enhancedExample.sentence).toBe('The quick brown fox jumps over the lazy dog.');
      expect(enhancedExample.context).toBe('daily-conversation');
      expect(enhancedExample.diversityScore).toBe(0.85);
      expect(enhancedExample.naturalnessScore).toBe(0.92);
      expect(enhancedExample.metadata.model).toBe('gpt-3.5-turbo');
    });

    it('should allow optional quality scores', () => {
      const exampleWithoutScores: EnhancedExampleSentence = {
        sentence: 'Test sentence.',
        translation: '测试句子。',
        highlightWord: 'test',
        context: 'technical-documentation',
        metadata: {
          generatedAt: new Date(),
          model: 'claude-3-sonnet',
          tokensUsed: 100,
        },
      };

      expect(exampleWithoutScores.diversityScore).toBeUndefined();
      expect(exampleWithoutScores.naturalnessScore).toBeUndefined();
    });

    it('should support all application context types', () => {
      const contexts: EnhancedExampleSentence['context'][] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ];

      contexts.forEach((context) => {
        const example: EnhancedExampleSentence = {
          sentence: 'Test',
          translation: '测试',
          highlightWord: 'test',
          context,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 50,
          },
        };

        expect(example.context).toBe(context);
      });
    });
  });

  describe('ExampleGenerationOptions', () => {
    it('should define required count field', () => {
      // Requirement 4.1: Specify example count
      const options: ExampleGenerationOptions = {
        count: 12,
      };

      expect(options.count).toBe(12);
    });

    it('should support optional contexts array', () => {
      // Requirement 1.3: Support multiple contexts
      const options: ExampleGenerationOptions = {
        count: 15,
        contexts: ['daily-conversation', 'business-communication'],
      };

      expect(options.contexts).toHaveLength(2);
      expect(options.contexts).toContain('daily-conversation');
    });

    it('should support optional quality threshold', () => {
      // Requirement 9.3: Quality score threshold
      const options: ExampleGenerationOptions = {
        count: 10,
        minQualityScore: 0.8,
      };

      expect(options.minQualityScore).toBe(0.8);
    });

    it('should support optional retry configuration', () => {
      const options: ExampleGenerationOptions = {
        count: 12,
        maxRetries: 3,
      };

      expect(options.maxRetries).toBe(3);
    });
  });

  describe('ExampleGenerationResult', () => {
    it('should contain examples and statistics', () => {
      // Requirement 4.6: Return statistics
      // Requirement 9.6: Quality statistics
      const result: ExampleGenerationResult = {
        examples: [
          {
            sentence: 'Example sentence.',
            translation: '示例句子。',
            highlightWord: 'example',
            context: 'daily-conversation',
            diversityScore: 0.75,
            naturalnessScore: 0.85,
            metadata: {
              generatedAt: new Date(),
              model: 'gpt-3.5-turbo',
              tokensUsed: 120,
            },
          },
        ],
        statistics: {
          totalGenerated: 15,
          filtered: 3,
          averageDiversityScore: 0.72,
          averageNaturalnessScore: 0.81,
          generationTime: 2500,
        },
      };

      expect(result.examples).toHaveLength(1);
      expect(result.statistics.totalGenerated).toBe(15);
      expect(result.statistics.filtered).toBe(3);
      expect(result.statistics.averageDiversityScore).toBe(0.72);
      expect(result.statistics.averageNaturalnessScore).toBe(0.81);
      expect(result.statistics.generationTime).toBe(2500);
    });

    it('should track filtering statistics', () => {
      const result: ExampleGenerationResult = {
        examples: [],
        statistics: {
          totalGenerated: 20,
          filtered: 8,
          averageDiversityScore: 0.65,
          averageNaturalnessScore: 0.70,
          generationTime: 3000,
        },
      };

      // 8 out of 20 were filtered (40% rejection rate)
      const rejectionRate = result.statistics.filtered / result.statistics.totalGenerated;
      expect(rejectionRate).toBe(0.4);
    });
  });

  describe('EnhancedExampleSentenceService Interface', () => {
    it('should define generateEnhancedExamples method signature', () => {
      // This test verifies the interface can be implemented
      const mockService: EnhancedExampleSentenceService = {
        generateEnhancedExamples: async (word: string, options: ExampleGenerationOptions) => {
          return {
            examples: [],
            statistics: {
              totalGenerated: 0,
              filtered: 0,
              averageDiversityScore: 0,
              averageNaturalnessScore: 0,
              generationTime: 0,
            },
          };
        },
        getExamplesWithCache: async (word: string, count: number) => {
          return [];
        },
        // Legacy methods for backward compatibility
        getExamples: async (word: string, count: number) => {
          return [];
        },
        validateExamples: (examples) => {
          return true;
        },
      };

      expect(mockService.generateEnhancedExamples).toBeDefined();
      expect(mockService.getExamplesWithCache).toBeDefined();
      expect(mockService.getExamples).toBeDefined();
      expect(mockService.validateExamples).toBeDefined();
    });

    it('should support async operations', async () => {
      const mockService: EnhancedExampleSentenceService = {
        generateEnhancedExamples: async (word: string, options: ExampleGenerationOptions) => {
          return {
            examples: [
              {
                sentence: `The word ${word} is useful.`,
                translation: `单词${word}很有用。`,
                highlightWord: word,
                context: 'daily-conversation',
                diversityScore: 0.8,
                naturalnessScore: 0.85,
                metadata: {
                  generatedAt: new Date(),
                  model: 'gpt-3.5-turbo',
                  tokensUsed: 100,
                },
              },
            ],
            statistics: {
              totalGenerated: 1,
              filtered: 0,
              averageDiversityScore: 0.8,
              averageNaturalnessScore: 0.85,
              generationTime: 1000,
            },
          };
        },
        getExamplesWithCache: async (word: string, count: number) => {
          return [];
        },
        // Legacy methods for backward compatibility
        getExamples: async (word: string, count: number) => {
          return [];
        },
        validateExamples: (examples) => {
          return true;
        },
      };

      const result = await mockService.generateEnhancedExamples('test', { count: 1 });
      expect(result.examples).toHaveLength(1);
      expect(result.examples[0].highlightWord).toBe('test');
    });

    it('should extend ExampleSentenceService interface', () => {
      // Requirement 4.1, 4.2, 4.3, 4.4: Backward compatibility
      // The interface should include legacy methods from ExampleSentenceService
      const mockService: EnhancedExampleSentenceService = {
        generateEnhancedExamples: async () => ({
          examples: [],
          statistics: {
            totalGenerated: 0,
            filtered: 0,
            averageDiversityScore: 0,
            averageNaturalnessScore: 0,
            generationTime: 0,
          },
        }),
        getExamplesWithCache: async () => [],
        getExamples: async () => [],
        validateExamples: () => true,
      };

      // Verify legacy methods are present
      expect(typeof mockService.getExamples).toBe('function');
      expect(typeof mockService.validateExamples).toBe('function');
    });
  });

  describe('Type Compatibility', () => {
    it('should be compatible with base ExampleSentence type', () => {
      const enhanced: EnhancedExampleSentence = {
        sentence: 'Test sentence.',
        translation: '测试句子。',
        highlightWord: 'test',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
        },
      };

      // Should be assignable to base type (structural compatibility)
      const base = {
        sentence: enhanced.sentence,
        translation: enhanced.translation,
        highlightWord: enhanced.highlightWord,
      };

      expect(base.sentence).toBe(enhanced.sentence);
      expect(base.translation).toBe(enhanced.translation);
      expect(base.highlightWord).toBe(enhanced.highlightWord);
    });
  });

  describe('EnhancedSentenceChain', () => {
    it('should extend SentenceChain with additional fields', () => {
      // Requirement 5.3: Context field
      // Requirement 5.6: Quality score and metadata
      const enhancedChain: EnhancedSentenceChain = {
        id: 'chain-1',
        sentence: 'The quick brown fox jumps over the lazy dog.',
        usedWordIds: ['word-1', 'word-2', 'word-3'],
        translation: '敏捷的棕色狐狸跳过懒狗。',
        context: 'daily-conversation',
        qualityScore: 0.88,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-3.5-turbo',
          tokensUsed: 200,
        },
      };

      expect(enhancedChain.id).toBe('chain-1');
      expect(enhancedChain.sentence).toBe('The quick brown fox jumps over the lazy dog.');
      expect(enhancedChain.usedWordIds).toHaveLength(3);
      expect(enhancedChain.context).toBe('daily-conversation');
      expect(enhancedChain.qualityScore).toBe(0.88);
      expect(enhancedChain.metadata.model).toBe('gpt-3.5-turbo');
    });

    it('should support all application context types', () => {
      const contexts: EnhancedSentenceChain['context'][] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ];

      contexts.forEach((context) => {
        const chain: EnhancedSentenceChain = {
          id: `chain-${context}`,
          sentence: 'Test sentence.',
          usedWordIds: ['word-1', 'word-2'],
          translation: '测试句子。',
          context,
          qualityScore: 0.75,
          metadata: {
            generatedAt: new Date(),
            model: 'claude-3-sonnet',
            tokensUsed: 150,
          },
        };

        expect(chain.context).toBe(context);
      });
    });

    it('should track multiple word usage', () => {
      // Requirement 5.2: Use 2-4 words per chain
      const chain: EnhancedSentenceChain = {
        id: 'chain-multi',
        sentence: 'The quick brown fox jumps.',
        usedWordIds: ['word-quick', 'word-brown', 'word-fox', 'word-jumps'],
        translation: '敏捷的棕色狐狸跳跃。',
        context: 'daily-conversation',
        qualityScore: 0.85,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-3.5-turbo',
          tokensUsed: 180,
        },
      };

      expect(chain.usedWordIds).toHaveLength(4);
      expect(chain.usedWordIds).toContain('word-quick');
      expect(chain.usedWordIds).toContain('word-jumps');
    });
  });

  describe('SentenceChainGenerationOptions', () => {
    it('should define required fields', () => {
      // Requirement 5.1: Specify chain count
      // Requirement 5.2: Min/max word constraints
      const options: SentenceChainGenerationOptions = {
        count: 6,
        minWords: 2,
        maxWords: 4,
      };

      expect(options.count).toBe(6);
      expect(options.minWords).toBe(2);
      expect(options.maxWords).toBe(4);
    });

    it('should support optional contexts array', () => {
      // Requirement 5.4: Cover multiple contexts
      const options: SentenceChainGenerationOptions = {
        count: 8,
        minWords: 2,
        maxWords: 4,
        contexts: ['daily-conversation', 'business-communication', 'academic-writing'],
      };

      expect(options.contexts).toHaveLength(3);
      expect(options.contexts).toContain('business-communication');
    });

    it('should support optional quality threshold', () => {
      const options: SentenceChainGenerationOptions = {
        count: 5,
        minWords: 2,
        maxWords: 3,
        minQualityScore: 0.75,
      };

      expect(options.minQualityScore).toBe(0.75);
    });

    it('should enforce word count constraints', () => {
      // Requirement 5.2: Each chain uses 2-4 words
      const options: SentenceChainGenerationOptions = {
        count: 7,
        minWords: 2,
        maxWords: 4,
      };

      expect(options.minWords).toBeGreaterThanOrEqual(2);
      expect(options.maxWords).toBeLessThanOrEqual(4);
      expect(options.maxWords).toBeGreaterThanOrEqual(options.minWords);
    });
  });

  describe('SentenceChainService Interface', () => {
    it('should define generateSentenceChains method signature', () => {
      // This test verifies the interface can be implemented
      const mockService: SentenceChainService = {
        generateSentenceChains: async (words, options) => {
          return [];
        },
        getSentenceChainsWithCache: async (words, count) => {
          return [];
        },
      };

      expect(mockService.generateSentenceChains).toBeDefined();
      expect(mockService.getSentenceChainsWithCache).toBeDefined();
    });

    it('should support async operations', async () => {
      const mockService: SentenceChainService = {
        generateSentenceChains: async (words, options) => {
          return [
            {
              id: 'chain-1',
              sentence: 'The quick brown fox jumps.',
              usedWordIds: words.map((w) => w.id),
              translation: '敏捷的棕色狐狸跳跃。',
              context: 'daily-conversation',
              qualityScore: 0.85,
              metadata: {
                generatedAt: new Date(),
                model: 'gpt-3.5-turbo',
                tokensUsed: 180,
              },
            },
          ];
        },
        getSentenceChainsWithCache: async (words, count) => {
          return [];
        },
      };

      const mockWords = [
        { id: 'w1', word: 'quick', definition: 'fast', translation: '快速的' },
        { id: 'w2', word: 'brown', definition: 'color', translation: '棕色的' },
      ];

      const result = await mockService.generateSentenceChains(mockWords, {
        count: 1,
        minWords: 2,
        maxWords: 4,
      });

      expect(result).toHaveLength(1);
      expect(result[0].usedWordIds).toHaveLength(2);
    });

    it('should handle multiple words in chains', async () => {
      // Requirement 5.2: Use 2-4 words per chain
      const mockService: SentenceChainService = {
        generateSentenceChains: async (words, options) => {
          const { minWords, maxWords } = options;
          const wordCount = Math.min(words.length, maxWords);

          return [
            {
              id: 'chain-multi',
              sentence: 'Test sentence with multiple words.',
              usedWordIds: words.slice(0, wordCount).map((w) => w.id),
              translation: '包含多个单词的测试句子。',
              context: 'daily-conversation',
              qualityScore: 0.8,
              metadata: {
                generatedAt: new Date(),
                model: 'gpt-3.5-turbo',
                tokensUsed: 200,
              },
            },
          ];
        },
        getSentenceChainsWithCache: async (words, count) => {
          return [];
        },
      };

      const mockWords = [
        { id: 'w1', word: 'test', definition: 'trial', translation: '测试' },
        { id: 'w2', word: 'word', definition: 'term', translation: '单词' },
        { id: 'w3', word: 'sentence', definition: 'phrase', translation: '句子' },
      ];

      const result = await mockService.generateSentenceChains(mockWords, {
        count: 1,
        minWords: 2,
        maxWords: 3,
      });

      expect(result[0].usedWordIds.length).toBeGreaterThanOrEqual(2);
      expect(result[0].usedWordIds.length).toBeLessThanOrEqual(3);
    });

    it('should support caching with getSentenceChainsWithCache', async () => {
      // Requirement 7.2, 7.3, 7.4: Cache support
      let cacheHit = false;

      const mockService: SentenceChainService = {
        generateSentenceChains: async (words, options) => {
          return [];
        },
        getSentenceChainsWithCache: async (words, count) => {
          if (cacheHit) {
            // Return cached result
            return [
              {
                id: 'cached-chain',
                sentence: 'Cached sentence.',
                usedWordIds: words.map((w) => w.id),
                translation: '缓存的句子。',
                context: 'daily-conversation',
                qualityScore: 0.9,
                metadata: {
                  generatedAt: new Date(Date.now() - 86400000), // 1 day ago
                  model: 'gpt-3.5-turbo',
                  tokensUsed: 150,
                },
              },
            ];
          }

          cacheHit = true;
          return [];
        },
      };

      const mockWords = [
        { id: 'w1', word: 'test', definition: 'trial', translation: '测试' },
      ];

      // First call - cache miss
      const result1 = await mockService.getSentenceChainsWithCache(mockWords, 1);
      expect(result1).toHaveLength(0);

      // Second call - cache hit
      const result2 = await mockService.getSentenceChainsWithCache(mockWords, 1);
      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe('cached-chain');
    });
  });

  describe('Sentence Chain Type Compatibility', () => {
    it('should be compatible with base SentenceChain type', () => {
      const enhanced: EnhancedSentenceChain = {
        id: 'chain-1',
        sentence: 'Test sentence.',
        usedWordIds: ['word-1', 'word-2'],
        translation: '测试句子。',
        context: 'daily-conversation',
        qualityScore: 0.8,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-3.5-turbo',
          tokensUsed: 150,
        },
      };

      // Should be assignable to base type (structural compatibility)
      const base = {
        id: enhanced.id,
        sentence: enhanced.sentence,
        usedWordIds: enhanced.usedWordIds,
        translation: enhanced.translation,
      };

      expect(base.id).toBe(enhanced.id);
      expect(base.sentence).toBe(enhanced.sentence);
      expect(base.usedWordIds).toEqual(enhanced.usedWordIds);
      expect(base.translation).toBe(enhanced.translation);
    });
  });
});

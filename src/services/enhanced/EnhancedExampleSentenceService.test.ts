/**
 * EnhancedExampleSentenceService Unit Tests
 * 
 * Tests the orchestration of AI generation, context analysis,
 * quality assessment, and caching for enhanced example sentences.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedExampleSentenceServiceImpl } from './EnhancedExampleSentenceService';
import type { AIService, ApplicationContext } from '../ai/types';
import type { ContextAnalyzer } from '../context/ContextAnalyzer';
import type { QualityAssessor } from '../quality/QualityAssessor';
import type { CacheManager } from '../cache/CacheManager';
import type { EnhancedExampleSentence } from './types';

describe('EnhancedExampleSentenceService', () => {
  let service: EnhancedExampleSentenceServiceImpl;
  let mockAIService: AIService;
  let mockContextAnalyzer: ContextAnalyzer;
  let mockQualityAssessor: QualityAssessor;
  let mockCacheManager: CacheManager;

  beforeEach(() => {
    // Mock AIService
    mockAIService = {
      generateExamples: vi.fn(),
      generateSentenceChains: vi.fn(),
      validateConnection: vi.fn(),
    };

    // Mock ContextAnalyzer
    mockContextAnalyzer = {
      analyzeContexts: vi.fn(),
    };

    // Mock QualityAssessor
    mockQualityAssessor = {
      assessExamples: vi.fn(),
      calculateDiversityScore: vi.fn(),
      calculateNaturalnessScore: vi.fn(),
    };

    // Mock CacheManager
    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      isExpired: vi.fn(),
      clear: vi.fn(),
      clearAll: vi.fn(),
      getStats: vi.fn(),
    };

    service = new EnhancedExampleSentenceServiceImpl(
      mockAIService,
      mockContextAnalyzer,
      mockQualityAssessor,
      mockCacheManager
    );
  });

  describe('generateEnhancedExamples', () => {
    it('should orchestrate all components to generate examples', async () => {
      // Arrange
      const word = 'test';
      const contexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
      ];

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts,
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.6,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'This is a test sentence.',
            translation: '这是一个测试句子。',
            highlightWord: 'test',
          },
          {
            sentence: 'We need to test this feature.',
            translation: '我们需要测试这个功能。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 100,
          generationTime: 500,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      const result = await service.generateEnhancedExamples(word, {
        count: 4,
      });

      // Assert
      expect(mockContextAnalyzer.analyzeContexts).toHaveBeenCalledWith(word);
      expect(mockAIService.generateExamples).toHaveBeenCalledTimes(2); // Once per context
      expect(mockQualityAssessor.assessExamples).toHaveBeenCalled();
      expect(result.examples.length).toBeGreaterThan(0);
      expect(result.statistics.totalGenerated).toBeGreaterThan(0);
      expect(result.statistics.averageDiversityScore).toBeGreaterThan(0);
      expect(result.statistics.averageNaturalnessScore).toBeGreaterThan(0);
    });

    it('should use provided contexts instead of analyzing', async () => {
      // Arrange
      const word = 'test';
      const contexts: ApplicationContext[] = ['daily-conversation'];

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'This is a test.',
            translation: '这是一个测试。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 300,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      await service.generateEnhancedExamples(word, {
        count: 2,
        contexts,
      });

      // Assert
      expect(mockContextAnalyzer.analyzeContexts).not.toHaveBeenCalled();
      expect(mockAIService.generateExamples).toHaveBeenCalledWith(
        expect.objectContaining({
          word,
          context: 'daily-conversation',
        })
      );
    });

    it('should filter examples below quality thresholds', async () => {
      // Arrange
      const word = 'test';

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'High quality test.',
            translation: '高质量测试。',
            highlightWord: 'test',
          },
          {
            sentence: 'Low quality test.',
            translation: '低质量测试。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 100,
          generationTime: 500,
        },
      });

      // Mock quality assessment with one high and one low quality example
      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) => [
          {
            ...examples[0],
            diversityScore: 0.7,
            naturalnessScore: 0.8, // High quality
          },
          {
            ...examples[1],
            diversityScore: 0.5,
            naturalnessScore: 0.4, // Low quality (below 0.6 and 0.7 thresholds)
          },
        ]
      );

      // Act
      const result = await service.generateEnhancedExamples(word, {
        count: 2,
        maxRetries: 0, // Disable retries for this test
      });

      // Assert
      expect(result.statistics.filtered).toBe(1); // One example filtered
      expect(result.examples.length).toBe(1); // Only high-quality example remains
      expect(result.examples[0].sentence).toBe('High quality test.');
    });

    it('should retry when insufficient high-quality examples', async () => {
      // Arrange
      const word = 'test';
      let callCount = 0;

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: 'daily-conversation',
      });

      // First call returns low quality, second call returns high quality
      vi.mocked(mockAIService.generateExamples).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            examples: [
              {
                sentence: 'Low quality.',
                translation: '低质量。',
                highlightWord: 'test',
              },
            ],
            metadata: {
              model: 'gpt-3.5-turbo',
              tokensUsed: 50,
              generationTime: 300,
            },
          };
        } else {
          return {
            examples: [
              {
                sentence: 'High quality test sentence.',
                translation: '高质量测试句子。',
                highlightWord: 'test',
              },
              {
                sentence: 'Another high quality test.',
                translation: '另一个高质量测试。',
                highlightWord: 'test',
              },
            ],
            metadata: {
              model: 'gpt-3.5-turbo',
              tokensUsed: 100,
              generationTime: 500,
            },
          };
        }
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) => {
          if (examples.length === 1) {
            // First call - low quality
            return [
              {
                ...examples[0],
                diversityScore: 0.4,
                naturalnessScore: 0.5,
              },
            ];
          } else {
            // Second call - high quality
            return examples.map((ex) => ({
              ...ex,
              diversityScore: 0.7,
              naturalnessScore: 0.8,
            }));
          }
        }
      );

      // Act
      const result = await service.generateEnhancedExamples(word, {
        count: 2,
        maxRetries: 1,
      });

      // Assert
      expect(callCount).toBeGreaterThan(1); // Should have retried
      expect(result.examples.length).toBeGreaterThan(0);
    });

    it('should distribute examples across multiple contexts', async () => {
      // Arrange
      const word = 'test';
      const contexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
      ];

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts,
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.7,
          'academic-writing': 0.6,
          'technical-documentation': 0.3,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      // Return enough examples to meet the 80% threshold (6 * 0.8 = 4.8, so need at least 5)
      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'Test sentence one.',
            translation: '测试句子一。',
            highlightWord: 'test',
          },
          {
            sentence: 'Test sentence two.',
            translation: '测试句子二。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 300,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      const result = await service.generateEnhancedExamples(word, {
        count: 6,
        maxRetries: 0, // Disable retries to avoid multiple calls
      });

      // Assert
      expect(mockAIService.generateExamples).toHaveBeenCalledTimes(3); // Once per context
      
      // Verify each context was called
      const calls = vi.mocked(mockAIService.generateExamples).mock.calls;
      const calledContexts = calls.map((call) => call[0].context);
      expect(calledContexts).toContain('daily-conversation');
      expect(calledContexts).toContain('business-communication');
      expect(calledContexts).toContain('academic-writing');
    });

    it('should include context metadata in generated examples', async () => {
      // Arrange
      const word = 'test';
      const context: ApplicationContext = 'daily-conversation';

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: [context],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: context,
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'This is a test.',
            translation: '这是一个测试。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 300,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      const result = await service.generateEnhancedExamples(word, {
        count: 1,
      });

      // Assert
      expect(result.examples[0].context).toBe(context);
      expect(result.examples[0].metadata).toBeDefined();
      expect(result.examples[0].metadata.model).toBe('gpt-3.5-turbo');
      expect(result.examples[0].metadata.generatedAt).toBeInstanceOf(Date);
    });

    it('should return statistics about generation', async () => {
      // Arrange
      const word = 'test';

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'Test 1.',
            translation: '测试1。',
            highlightWord: 'test',
          },
          {
            sentence: 'Test 2.',
            translation: '测试2。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 100,
          generationTime: 500,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      const result = await service.generateEnhancedExamples(word, {
        count: 2,
      });

      // Assert
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalGenerated).toBeGreaterThan(0);
      expect(result.statistics.filtered).toBeGreaterThanOrEqual(0);
      expect(result.statistics.averageDiversityScore).toBeGreaterThan(0);
      expect(result.statistics.averageNaturalnessScore).toBeGreaterThan(0);
      expect(result.statistics.generationTime).toBeGreaterThanOrEqual(0); // Changed to >= 0 since it can be 0ms
    });
  });

  describe('getExamplesWithCache', () => {
    it('should return cached examples when available and not expired', async () => {
      // Arrange
      const word = 'test';
      const cachedExamples: EnhancedExampleSentence[] = [
        {
          sentence: 'Cached test sentence.',
          translation: '缓存的测试句子。',
          highlightWord: 'test',
          context: 'daily-conversation',
          diversityScore: 0.7,
          naturalnessScore: 0.8,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 100,
          },
        },
      ];

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word,
        examples: cachedExamples,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000), // Tomorrow
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      // Act
      const result = await service.getExamplesWithCache(word, 1);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalledWith(word);
      expect(mockCacheManager.isExpired).toHaveBeenCalled();
      expect(mockAIService.generateExamples).not.toHaveBeenCalled();
      expect(result).toEqual(cachedExamples);
    });

    it('should generate new examples when cache is expired', async () => {
      // Arrange
      const word = 'test';

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word,
        examples: [],
        generatedAt: new Date(Date.now() - 86400000 * 31), // 31 days ago
        expiresAt: new Date(Date.now() - 86400000), // Yesterday
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(true);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'New test sentence.',
            translation: '新的测试句子。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 300,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      const result = await service.getExamplesWithCache(word, 1);

      // Assert
      expect(mockCacheManager.isExpired).toHaveBeenCalled();
      expect(mockAIService.generateExamples).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate new examples when cache miss', async () => {
      // Arrange
      const word = 'test';

      vi.mocked(mockCacheManager.get).mockResolvedValue(null);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'New test sentence.',
            translation: '新的测试句子。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 300,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      const result = await service.getExamplesWithCache(word, 1);

      // Assert
      expect(mockCacheManager.get).toHaveBeenCalledWith(word);
      expect(mockAIService.generateExamples).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should cache newly generated examples', async () => {
      // Arrange
      const word = 'test';

      vi.mocked(mockCacheManager.get).mockResolvedValue(null);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.3,
          'academic-writing': 0.2,
          'technical-documentation': 0.1,
          'literary-expression': 0.2,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateExamples).mockResolvedValue({
        examples: [
          {
            sentence: 'New test sentence.',
            translation: '新的测试句子。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 300,
        },
      });

      vi.mocked(mockQualityAssessor.assessExamples).mockImplementation(
        async (examples) =>
          examples.map((ex) => ({
            ...ex,
            diversityScore: 0.7,
            naturalnessScore: 0.8,
          }))
      );

      // Act
      await service.getExamplesWithCache(word, 1);

      // Assert
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        word,
        expect.objectContaining({
          examples: expect.any(Array),
          generatedAt: expect.any(Date),
        })
      );
    });

    it('should return empty array on error', async () => {
      // Arrange
      const word = 'test';

      vi.mocked(mockCacheManager.get).mockRejectedValue(
        new Error('Cache error')
      );

      // Act
      const result = await service.getExamplesWithCache(word, 1);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getExamples (legacy method)', () => {
    it('should convert enhanced examples to base format', async () => {
      // Arrange
      const word = 'test';
      const count = 2;
      const cachedExamples: EnhancedExampleSentence[] = [
        {
          sentence: 'This is a test sentence.',
          translation: '这是一个测试句子。',
          highlightWord: 'test',
          context: 'daily-conversation',
          diversityScore: 0.7,
          naturalnessScore: 0.8,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 100,
          },
        },
        {
          sentence: 'Another test example.',
          translation: '另一个测试例子。',
          highlightWord: 'test',
          context: 'business-communication',
          diversityScore: 0.6,
          naturalnessScore: 0.75,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 80,
          },
        },
      ];

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word,
        examples: cachedExamples,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      // Act
      const result = await service.getExamples(word, count);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sentence: 'This is a test sentence.',
        translation: '这是一个测试句子。',
        highlightWord: 'test',
      });
      expect(result[1]).toEqual({
        sentence: 'Another test example.',
        translation: '另一个测试例子。',
        highlightWord: 'test',
      });
      // Verify enhanced fields are stripped
      expect(result[0]).not.toHaveProperty('context');
      expect(result[0]).not.toHaveProperty('diversityScore');
      expect(result[0]).not.toHaveProperty('naturalnessScore');
      expect(result[0]).not.toHaveProperty('metadata');
    });

    it('should return empty array on error', async () => {
      // Arrange
      const word = 'test';
      vi.mocked(mockCacheManager.get).mockRejectedValue(
        new Error('Cache error')
      );

      // Act
      const result = await service.getExamples(word, 2);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('validateExamples (legacy method)', () => {
    it('should validate correct examples', () => {
      // Arrange
      const examples = [
        {
          sentence: 'This is a test sentence.',
          translation: '这是一个测试句子。',
          highlightWord: 'test',
        },
        {
          sentence: 'Another test example.',
          translation: '另一个测试例子。',
          highlightWord: 'test',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(true);
    });

    it('should reject empty examples array', () => {
      // Act
      const result = service.validateExamples([]);

      // Assert
      expect(result).toBe(false);
    });

    it('should reject examples with empty sentence', () => {
      // Arrange
      const examples = [
        {
          sentence: '',
          translation: '测试。',
          highlightWord: 'test',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(false);
    });

    it('should reject examples with empty translation', () => {
      // Arrange
      const examples = [
        {
          sentence: 'This is a test.',
          translation: '',
          highlightWord: 'test',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(false);
    });

    it('should reject examples with empty highlightWord', () => {
      // Arrange
      const examples = [
        {
          sentence: 'This is a test.',
          translation: '这是一个测试。',
          highlightWord: '',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(false);
    });

    it('should reject examples where sentence does not contain highlightWord', () => {
      // Arrange
      const examples = [
        {
          sentence: 'This is an example.',
          translation: '这是一个例子。',
          highlightWord: 'test',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(false);
    });

    it('should validate examples with case-insensitive word matching', () => {
      // Arrange
      const examples = [
        {
          sentence: 'This is a TEST sentence.',
          translation: '这是一个测试句子。',
          highlightWord: 'test',
        },
        {
          sentence: 'Another Test example.',
          translation: '另一个测试例子。',
          highlightWord: 'test',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(true);
    });

    it('should reject examples with whitespace-only fields', () => {
      // Arrange
      const examples = [
        {
          sentence: '   ',
          translation: '测试。',
          highlightWord: 'test',
        },
      ];

      // Act
      const result = service.validateExamples(examples);

      // Assert
      expect(result).toBe(false);
    });
  });
});

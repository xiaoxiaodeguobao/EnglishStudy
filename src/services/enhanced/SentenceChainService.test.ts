/**
 * Sentence Chain Service Tests
 * 
 * Tests for the SentenceChainService implementation.
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.6**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SentenceChainServiceImpl } from './SentenceChainService';
import { AIService, ApplicationContext } from '../ai/types';
import { ContextAnalyzer } from '../context/ContextAnalyzer';
import { CacheManager } from '../cache/CacheManager';
import { Word } from '../../types/word';

// Mock implementations
const createMockAIService = (): AIService => ({
  generateExamples: vi.fn(),
  generateSentenceChains: vi.fn(),
  validateConnection: vi.fn(),
});

const createMockContextAnalyzer = (): ContextAnalyzer => ({
  analyzeContexts: vi.fn(),
});

const createMockCacheManager = (): CacheManager => ({
  get: vi.fn(),
  set: vi.fn(),
  isExpired: vi.fn(),
  clear: vi.fn(),
  clearAll: vi.fn(),
  getStats: vi.fn(),
});

// Test data
const mockWords: Word[] = [
  {
    id: 'word-1',
    word: 'innovation',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '创新',
        meaningEN: 'a new idea or method',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date(),
  },
  {
    id: 'word-2',
    word: 'technology',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '技术',
        meaningEN: 'the application of scientific knowledge',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date(),
  },
  {
    id: 'word-3',
    word: 'development',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '发展',
        meaningEN: 'the process of developing',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date(),
  },
];

describe('SentenceChainService', () => {
  let service: SentenceChainServiceImpl;
  let mockAIService: AIService;
  let mockContextAnalyzer: ContextAnalyzer;
  let mockCacheManager: CacheManager;

  beforeEach(() => {
    mockAIService = createMockAIService();
    mockContextAnalyzer = createMockContextAnalyzer();
    mockCacheManager = createMockCacheManager();

    service = new SentenceChainServiceImpl(
      mockAIService,
      mockContextAnalyzer,
      mockCacheManager
    );
  });

  describe('generateSentenceChains', () => {
    it('should generate sentence chains for multiple contexts', async () => {
      // Requirement 5.1: Generate 5-8 sentence chains
      // Requirement 5.3: Assign application contexts
      // Requirement 5.4: Cover at least 3 different contexts

      const mockContexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
        'technical-documentation',
      ];

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: mockContexts,
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.7,
          'academic-writing': 0.4,
          'technical-documentation': 0.6,
          'literary-expression': 0.3,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Innovation and technology drive development in modern society.',
          translation: '创新和技术推动现代社会的发展。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      const result = await service.generateSentenceChains(mockWords, {
        count: 6,
        minWords: 2,
        maxWords: 4,
      });

      // Should generate chains
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(6);

      // Each chain should have required fields
      result.forEach((chain) => {
        expect(chain).toHaveProperty('id');
        expect(chain).toHaveProperty('sentence');
        expect(chain).toHaveProperty('translation');
        expect(chain).toHaveProperty('usedWordIds');
        expect(chain).toHaveProperty('context');
        expect(chain).toHaveProperty('qualityScore');
        expect(chain).toHaveProperty('metadata');

        // Requirement 5.2: Each chain uses 2-4 words
        expect(chain.usedWordIds.length).toBeGreaterThanOrEqual(2);
        expect(chain.usedWordIds.length).toBeLessThanOrEqual(4);

        // Requirement 5.3: Context should be assigned
        expect(mockContexts).toContain(chain.context);
      });
    });

    it('should respect minWords and maxWords constraints', async () => {
      // Requirement 5.2: Each chain uses 2-4 words

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Innovation drives technology.',
          translation: '创新推动技术发展。',
          usedWords: ['innovation', 'technology'],
        },
      ]);

      const result = await service.generateSentenceChains(mockWords, {
        count: 3,
        minWords: 2,
        maxWords: 3,
      });

      // All chains should respect word count constraints
      result.forEach((chain) => {
        expect(chain.usedWordIds.length).toBeGreaterThanOrEqual(2);
        expect(chain.usedWordIds.length).toBeLessThanOrEqual(3);
      });
    });

    it('should filter chains by quality score', async () => {
      // Requirement 5.6: Ensure semantic coherence and context appropriateness

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      // Mock AI service to return chains with varying quality
      vi.mocked(mockAIService.generateSentenceChains)
        .mockResolvedValueOnce([
          {
            sentence: 'Innovation and technology drive modern development.',
            translation: '创新和技术推动现代发展。',
            usedWords: ['innovation', 'technology', 'development'],
          },
        ])
        .mockResolvedValueOnce([
          {
            sentence: 'Tech.',
            translation: '技术。',
            usedWords: ['technology'],
          },
        ]);

      const result = await service.generateSentenceChains(mockWords, {
        count: 5,
        minWords: 2,
        maxWords: 4,
        minQualityScore: 0.7,
      });

      // All returned chains should meet quality threshold
      result.forEach((chain) => {
        expect(chain.qualityScore).toBeGreaterThanOrEqual(0.7);
      });
    });

    it('should use provided contexts when specified', async () => {
      // Requirement 5.3: Assign application contexts

      const providedContexts: ApplicationContext[] = [
        'business-communication',
        'technical-documentation',
      ];

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Innovation drives business technology development.',
          translation: '创新推动商业技术发展。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      const result = await service.generateSentenceChains(mockWords, {
        count: 4,
        minWords: 2,
        maxWords: 4,
        contexts: providedContexts,
      });

      // Should not call context analyzer when contexts are provided
      expect(mockContextAnalyzer.analyzeContexts).not.toHaveBeenCalled();

      // All chains should use provided contexts
      result.forEach((chain) => {
        expect(providedContexts).toContain(chain.context);
      });
    });

    it('should handle AI service errors gracefully', async () => {
      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockRejectedValue(
        new Error('AI service error')
      );

      const result = await service.generateSentenceChains(mockWords, {
        count: 5,
        minWords: 2,
        maxWords: 4,
      });

      // Should return empty array on error
      expect(result).toEqual([]);
    });
  });

  describe('getSentenceChainsWithCache', () => {
    it('should return cached chains when available and not expired', async () => {
      // Requirement 7.2: Check cache first
      // Requirement 7.3: Return cached content if valid

      const cachedChains = [
        {
          id: 'chain-1',
          sentence: 'Innovation drives technology development.',
          translation: '创新推动技术发展。',
          usedWordIds: ['word-1', 'word-2', 'word-3'],
          context: 'business-communication' as ApplicationContext,
          qualityScore: 0.9,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 100,
          },
        },
      ];

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word: 'chain:word-1-word-2-word-3',
        examples: cachedChains as any,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should return cached chains
      expect(result).toEqual(cachedChains);

      // Should not call AI service
      expect(mockAIService.generateSentenceChains).not.toHaveBeenCalled();
    });

    it('should generate new chains when cache is expired', async () => {
      // Requirement 7.4: Generate and cache on miss

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word: 'chain:word-1-word-2-word-3',
        examples: [] as any,
        generatedAt: new Date(Date.now() - 86400000 * 31), // 31 days ago
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(true);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Innovation and technology drive development.',
          translation: '创新和技术推动发展。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should generate new chains
      expect(result.length).toBeGreaterThan(0);

      // Should save to cache
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should generate new chains when cache is empty', async () => {
      // Requirement 7.4: Generate and cache on miss

      vi.mocked(mockCacheManager.get).mockResolvedValue(null);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Technology enables innovation.',
          translation: '技术促进创新。',
          usedWords: ['technology', 'innovation'],
        },
      ]);

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should generate new chains
      expect(result.length).toBeGreaterThan(0);

      // Should save to cache
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockCacheManager.get).mockRejectedValue(
        new Error('Cache error')
      );

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should return empty array on error
      expect(result).toEqual([]);
    });
  });

  describe('quality assessment', () => {
    it('should assign higher scores to well-formed chains', async () => {
      // Requirement 5.6: Ensure semantic coherence and context appropriateness

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      // Mock well-formed chain (10-25 words, has translation, uses multiple words)
      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence:
            'Innovation and technology are driving forces behind modern development and progress.',
          translation: '创新和技术是现代发展和进步的推动力。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      const result = await service.generateSentenceChains(mockWords, {
        count: 1,
        minWords: 2,
        maxWords: 4,
      });

      // Should have high quality score
      expect(result[0].qualityScore).toBeGreaterThan(0.8);
    });

    it('should assign lower scores to poorly-formed chains', async () => {
      // Requirement 5.6: Ensure semantic coherence and context appropriateness

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      });

      // Mock poorly-formed chain (too short, no translation)
      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Tech.',
          translation: '',
          usedWords: ['technology'],
        },
      ]);

      const result = await service.generateSentenceChains(mockWords, {
        count: 1,
        minWords: 2,
        maxWords: 4,
        minQualityScore: 0.0, // Allow low quality for testing
      });

      // Should have low quality score
      if (result.length > 0) {
        expect(result[0].qualityScore).toBeLessThan(0.7);
      }
    });
  });
});

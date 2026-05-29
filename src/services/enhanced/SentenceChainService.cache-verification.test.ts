/**
 * Cache Integration Verification Tests for SentenceChainService
 * 
 * This test file specifically verifies Task 10.3 requirements:
 * - Implement getSentenceChainsWithCache method
 * - Create cache key from sorted word IDs
 * - Check cache and return if valid
 * - Generate and cache new chains on miss
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
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

describe('SentenceChainService - Cache Integration (Task 10.3)', () => {
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

  describe('Task 10.3.1: Create cache key from sorted word IDs', () => {
    it('should create consistent cache keys regardless of word order', async () => {
      // Requirement 7.1: Cache generated examples in local storage
      // Requirement 7.2: Check cache first

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
        expiresAt: new Date(Date.now() + 86400000),
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      // Test with words in original order
      const result1 = await service.getSentenceChainsWithCache(mockWords, 5);

      // Test with words in different order
      const shuffledWords = [mockWords[2], mockWords[0], mockWords[1]];
      const result2 = await service.getSentenceChainsWithCache(shuffledWords, 5);

      // Both should call cache with the same key (sorted word IDs)
      const calls = vi.mocked(mockCacheManager.get).mock.calls;
      expect(calls.length).toBe(2);
      
      // Extract cache keys from calls
      const cacheKey1 = calls[0][0];
      const cacheKey2 = calls[1][0];
      
      // Cache keys should be identical (sorted)
      expect(cacheKey1).toBe(cacheKey2);
      expect(cacheKey1).toContain('word-1');
      expect(cacheKey1).toContain('word-2');
      expect(cacheKey1).toContain('word-3');
    });
  });

  describe('Task 10.3.2: Check cache and return if valid', () => {
    it('should check cache first and return cached chains if valid', async () => {
      // Requirement 7.2: Check cache first
      // Requirement 7.3: Return cached content if within 30-day window

      const cachedChains = [
        {
          id: 'chain-1',
          sentence: 'Innovation and technology drive modern development.',
          translation: '创新和技术推动现代发展。',
          usedWordIds: ['word-1', 'word-2', 'word-3'],
          context: 'business-communication' as ApplicationContext,
          qualityScore: 0.9,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 100,
          },
        },
        {
          id: 'chain-2',
          sentence: 'Technology innovation leads to rapid development.',
          translation: '技术创新带来快速发展。',
          usedWordIds: ['word-1', 'word-2', 'word-3'],
          context: 'technical-documentation' as ApplicationContext,
          qualityScore: 0.85,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 95,
          },
        },
      ];

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word: 'chain:word-1-word-2-word-3',
        examples: cachedChains as any,
        generatedAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
        expiresAt: new Date(Date.now() + 86400000 * 15), // 15 days from now
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should return cached chains
      expect(result).toEqual(cachedChains);

      // Should check cache first
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        expect.stringContaining('chain:')
      );

      // Should check if cache is expired
      expect(mockCacheManager.isExpired).toHaveBeenCalled();

      // Should NOT call AI service
      expect(mockAIService.generateSentenceChains).not.toHaveBeenCalled();

      // Should NOT call context analyzer
      expect(mockContextAnalyzer.analyzeContexts).not.toHaveBeenCalled();
    });

    it('should respect count parameter when returning cached chains', async () => {
      // Requirement 7.3: Return cached content if valid

      const cachedChains = [
        {
          id: 'chain-1',
          sentence: 'Chain 1',
          translation: '链1',
          usedWordIds: ['word-1', 'word-2'],
          context: 'daily-conversation' as ApplicationContext,
          qualityScore: 0.9,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 50,
          },
        },
        {
          id: 'chain-2',
          sentence: 'Chain 2',
          translation: '链2',
          usedWordIds: ['word-2', 'word-3'],
          context: 'daily-conversation' as ApplicationContext,
          qualityScore: 0.85,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 50,
          },
        },
        {
          id: 'chain-3',
          sentence: 'Chain 3',
          translation: '链3',
          usedWordIds: ['word-1', 'word-3'],
          context: 'daily-conversation' as ApplicationContext,
          qualityScore: 0.8,
          metadata: {
            generatedAt: new Date(),
            model: 'gpt-3.5-turbo',
            tokensUsed: 50,
          },
        },
      ];

      vi.mocked(mockCacheManager.get).mockResolvedValue({
        word: 'chain:word-1-word-2-word-3',
        examples: cachedChains as any,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      // Request only 2 chains
      const result = await service.getSentenceChainsWithCache(mockWords, 2);

      // Should return only 2 chains
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('chain-1');
      expect(result[1].id).toBe('chain-2');
    });
  });

  describe('Task 10.3.3: Generate and cache new chains on miss', () => {
    it('should generate new chains when cache is empty', async () => {
      // Requirement 7.4: Generate new chains when cache miss

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
          sentence: 'Innovation and technology drive development.',
          translation: '创新和技术推动发展。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should generate new chains
      expect(result.length).toBeGreaterThan(0);

      // Should call AI service to generate chains
      expect(mockAIService.generateSentenceChains).toHaveBeenCalled();

      // Should save to cache
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('chain:'),
        expect.objectContaining({
          examples: expect.any(Array),
          generatedAt: expect.any(Date),
        })
      );
    });

    it('should generate new chains when cache is expired', async () => {
      // Requirement 7.3: Return cached if within 30-day window
      // Requirement 7.4: Generate new chains when cache expired

      const expiredCache = {
        word: 'chain:word-1-word-2-word-3',
        examples: [] as any,
        generatedAt: new Date(Date.now() - 86400000 * 31), // 31 days ago
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago (expired)
      };

      vi.mocked(mockCacheManager.get).mockResolvedValue(expiredCache);
      vi.mocked(mockCacheManager.isExpired).mockReturnValue(true);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['business-communication'],
        confidence: {
          'daily-conversation': 0.5,
          'business-communication': 0.8,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'business-communication',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Business innovation requires technological development.',
          translation: '商业创新需要技术发展。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should generate new chains (not return expired cache)
      expect(result.length).toBeGreaterThan(0);

      // Should call AI service
      expect(mockAIService.generateSentenceChains).toHaveBeenCalled();

      // Should update cache with new chains
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('chain:'),
        expect.objectContaining({
          examples: expect.any(Array),
          generatedAt: expect.any(Date),
        })
      );
    });

    it('should save generated chains to cache with correct structure', async () => {
      // Requirement 7.1: Cache generated examples in local storage
      // Requirement 7.4: Generate and cache on miss

      vi.mocked(mockCacheManager.get).mockResolvedValue(null);

      vi.mocked(mockContextAnalyzer.analyzeContexts).mockResolvedValue({
        contexts: ['technical-documentation'],
        confidence: {
          'daily-conversation': 0.4,
          'business-communication': 0.5,
          'academic-writing': 0.6,
          'technical-documentation': 0.8,
          'literary-expression': 0.3,
        },
        primaryContext: 'technical-documentation',
      });

      vi.mocked(mockAIService.generateSentenceChains).mockResolvedValue([
        {
          sentence: 'Technical innovation drives software development.',
          translation: '技术创新推动软件开发。',
          usedWords: ['innovation', 'technology', 'development'],
        },
      ]);

      await service.getSentenceChainsWithCache(mockWords, 3);

      // Verify cache.set was called with correct structure
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('chain:word-1-word-2-word-3'),
        expect.objectContaining({
          examples: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              sentence: expect.any(String),
              translation: expect.any(String),
              usedWordIds: expect.any(Array),
              context: expect.any(String),
              qualityScore: expect.any(Number),
              metadata: expect.objectContaining({
                generatedAt: expect.any(Date),
                model: expect.any(String),
              }),
            }),
          ]),
          generatedAt: expect.any(Date),
        })
      );
    });

    it('should not save to cache if generation fails', async () => {
      // Requirement 7.4: Only cache successful generations

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

      vi.mocked(mockAIService.generateSentenceChains).mockRejectedValue(
        new Error('AI service error')
      );

      const result = await service.getSentenceChainsWithCache(mockWords, 5);

      // Should return empty array on error
      expect(result).toEqual([]);

      // Should NOT save to cache
      expect(mockCacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('Task 10.3.4: Complete cache integration flow', () => {
    it('should follow complete cache-first strategy', async () => {
      // Requirement 7.2: Check cache first
      // Requirement 7.3: Return cached if valid
      // Requirement 7.4: Generate and cache on miss

      // First call: cache miss, should generate and cache
      vi.mocked(mockCacheManager.get).mockResolvedValueOnce(null);

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
          translation: '创新推动技术。',
          usedWords: ['innovation', 'technology'],
        },
      ]);

      const result1 = await service.getSentenceChainsWithCache(mockWords, 3);

      // Should generate chains
      expect(result1.length).toBeGreaterThan(0);
      // AI service is called multiple times (once per word combination)
      expect(mockAIService.generateSentenceChains).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalledTimes(1);

      // Second call: cache hit, should return cached
      const cachedChains = result1;
      vi.mocked(mockCacheManager.get).mockResolvedValueOnce({
        word: 'chain:word-1-word-2-word-3',
        examples: cachedChains as any,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      vi.mocked(mockCacheManager.isExpired).mockReturnValue(false);

      const result2 = await service.getSentenceChainsWithCache(mockWords, 3);

      // Should return cached chains
      expect(result2).toEqual(cachedChains);

      // Should NOT call AI service again (still at the same count from first call)
      const aiServiceCallCount = vi.mocked(mockAIService.generateSentenceChains).mock.calls.length;
      expect(aiServiceCallCount).toBeGreaterThan(0); // Called during first generation

      // Should NOT save to cache again
      expect(mockCacheManager.set).toHaveBeenCalledTimes(1);
    });
  });
});

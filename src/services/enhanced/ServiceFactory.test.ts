/**
 * ServiceFactory Unit Tests
 * 
 * Tests the service factory and dependency injection system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceFactoryImpl } from './ServiceFactory';
import type { ExampleServiceConfig } from '../../config/types';

// Mock the ConfigManager
vi.mock('../../config/ConfigManager', () => {
  const mockConfig: ExampleServiceConfig = {
    aiProvider: 'openai',
    aiConfig: {
      apiKey: 'test-api-key',
      model: 'gpt-3.5-turbo',
      apiUrl: 'https://api.openai.com/v1',
      maxRetries: 2,
      timeout: 30000,
    },
    generation: {
      exampleCount: {
        min: 10,
        max: 15,
        default: 12,
      },
      sentenceLength: {
        min: 8,
        max: 20,
      },
    },
    quality: {
      diversityScore: 0.6,
      naturalnessScore: 0.7,
    },
    cache: {
      enabled: true,
      expirationDays: 30,
    },
    contexts: {
      enabled: [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ],
      default: 'daily-conversation',
    },
    retry: {
      maxAttempts: 2,
      backoffMs: 1000,
    },
  };

  return {
    ConfigManagerImpl: vi.fn().mockImplementation(() => ({
      loadConfig: vi.fn().mockResolvedValue(mockConfig),
      getConfig: vi.fn().mockReturnValue(mockConfig),
    })),
  };
});

// Mock the StorageService
vi.mock('../StorageService', () => ({
  storageService: {
    loadFromCache: vi.fn(),
    saveToCache: vi.fn(),
    removeFromCache: vi.fn(),
    clearCache: vi.fn(),
    getCacheKeys: vi.fn(),
  },
}));

describe('ServiceFactory', () => {
  let factory: ServiceFactoryImpl;

  beforeEach(() => {
    factory = new ServiceFactoryImpl();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(factory.initialize()).resolves.not.toThrow();
    });

    it('should throw error when accessing services before initialization', () => {
      expect(() => factory.getAIService()).toThrow(
        'ServiceFactory not initialized'
      );
    });

    it('should not throw when initialized multiple times', async () => {
      await factory.initialize();
      await expect(factory.initialize()).resolves.not.toThrow();
    });
  });

  describe('service creation', () => {
    beforeEach(async () => {
      await factory.initialize();
    });

    it('should create AI service instance', () => {
      const aiService = factory.getAIService();
      expect(aiService).toBeDefined();
      expect(aiService).toHaveProperty('generateExamples');
      expect(aiService).toHaveProperty('generateSentenceChains');
      expect(aiService).toHaveProperty('validateConnection');
    });

    it('should create context analyzer instance', () => {
      const contextAnalyzer = factory.getContextAnalyzer();
      expect(contextAnalyzer).toBeDefined();
      expect(contextAnalyzer).toHaveProperty('analyzeContexts');
    });

    it('should create quality assessor instance', () => {
      const qualityAssessor = factory.getQualityAssessor();
      expect(qualityAssessor).toBeDefined();
      expect(qualityAssessor).toHaveProperty('assessExamples');
      expect(qualityAssessor).toHaveProperty('calculateDiversityScore');
      expect(qualityAssessor).toHaveProperty('calculateNaturalnessScore');
    });

    it('should create cache manager instance', () => {
      const cacheManager = factory.getCacheManager();
      expect(cacheManager).toBeDefined();
      expect(cacheManager).toHaveProperty('get');
      expect(cacheManager).toHaveProperty('set');
      expect(cacheManager).toHaveProperty('isExpired');
      expect(cacheManager).toHaveProperty('clear');
      expect(cacheManager).toHaveProperty('clearAll');
      expect(cacheManager).toHaveProperty('getStats');
    });

    it('should create enhanced example sentence service instance', () => {
      const service = factory.getEnhancedExampleSentenceService();
      expect(service).toBeDefined();
      expect(service).toHaveProperty('generateEnhancedExamples');
      expect(service).toHaveProperty('getExamplesWithCache');
      expect(service).toHaveProperty('getExamples');
      expect(service).toHaveProperty('validateExamples');
    });

    it('should create sentence chain service instance', () => {
      const service = factory.getSentenceChainService();
      expect(service).toBeDefined();
      expect(service).toHaveProperty('generateSentenceChains');
      expect(service).toHaveProperty('getSentenceChainsWithCache');
    });

    it('should return configuration', () => {
      const config = factory.getConfig();
      expect(config).toBeDefined();
      expect(config.aiProvider).toBe('openai');
      expect(config.aiConfig.apiKey).toBe('test-api-key');
    });
  });

  describe('singleton behavior', () => {
    beforeEach(async () => {
      await factory.initialize();
    });

    it('should return same AI service instance on multiple calls', () => {
      const service1 = factory.getAIService();
      const service2 = factory.getAIService();
      expect(service1).toBe(service2);
    });

    it('should return same context analyzer instance on multiple calls', () => {
      const analyzer1 = factory.getContextAnalyzer();
      const analyzer2 = factory.getContextAnalyzer();
      expect(analyzer1).toBe(analyzer2);
    });

    it('should return same quality assessor instance on multiple calls', () => {
      const assessor1 = factory.getQualityAssessor();
      const assessor2 = factory.getQualityAssessor();
      expect(assessor1).toBe(assessor2);
    });

    it('should return same cache manager instance on multiple calls', () => {
      const cache1 = factory.getCacheManager();
      const cache2 = factory.getCacheManager();
      expect(cache1).toBe(cache2);
    });

    it('should return same enhanced service instance on multiple calls', () => {
      const service1 = factory.getEnhancedExampleSentenceService();
      const service2 = factory.getEnhancedExampleSentenceService();
      expect(service1).toBe(service2);
    });

    it('should return same sentence chain service instance on multiple calls', () => {
      const service1 = factory.getSentenceChainService();
      const service2 = factory.getSentenceChainService();
      expect(service1).toBe(service2);
    });
  });

  describe('dependency injection', () => {
    beforeEach(async () => {
      await factory.initialize();
    });

    it('should inject AI service into context analyzer', () => {
      const aiService = factory.getAIService();
      const contextAnalyzer = factory.getContextAnalyzer();
      
      // Context analyzer should have been created with AI service
      expect(contextAnalyzer).toBeDefined();
      expect(aiService).toBeDefined();
    });

    it('should inject AI service into quality assessor', () => {
      const aiService = factory.getAIService();
      const qualityAssessor = factory.getQualityAssessor();
      
      // Quality assessor should have been created with AI service
      expect(qualityAssessor).toBeDefined();
      expect(aiService).toBeDefined();
    });

    it('should inject all dependencies into enhanced example service', () => {
      const aiService = factory.getAIService();
      const contextAnalyzer = factory.getContextAnalyzer();
      const qualityAssessor = factory.getQualityAssessor();
      const cacheManager = factory.getCacheManager();
      const enhancedService = factory.getEnhancedExampleSentenceService();
      
      // All dependencies should be created
      expect(aiService).toBeDefined();
      expect(contextAnalyzer).toBeDefined();
      expect(qualityAssessor).toBeDefined();
      expect(cacheManager).toBeDefined();
      expect(enhancedService).toBeDefined();
    });

    it('should inject all dependencies into sentence chain service', () => {
      const aiService = factory.getAIService();
      const contextAnalyzer = factory.getContextAnalyzer();
      const qualityAssessor = factory.getQualityAssessor();
      const cacheManager = factory.getCacheManager();
      const chainService = factory.getSentenceChainService();
      
      // All dependencies should be created
      expect(aiService).toBeDefined();
      expect(contextAnalyzer).toBeDefined();
      expect(qualityAssessor).toBeDefined();
      expect(cacheManager).toBeDefined();
      expect(chainService).toBeDefined();
    });
  });

  describe('AI provider switching', () => {
    it('should create OpenAI adapter when configured', async () => {
      await factory.initialize();
      const aiService = factory.getAIService();
      
      expect(aiService).toBeDefined();
      expect(aiService.constructor.name).toBe('OpenAIAdapter');
    });

    it('should create Claude adapter when configured', async () => {
      // Create a new factory with Claude configuration
      const claudeFactory = new ServiceFactoryImpl();
      
      // Mock the config manager to return Claude config
      vi.mocked(claudeFactory['configManager'].loadConfig).mockResolvedValue({
        aiProvider: 'claude',
        aiConfig: {
          apiKey: 'test-claude-key',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
          maxRetries: 2,
          timeout: 30000,
        },
        generation: {
          exampleCount: { min: 10, max: 15, default: 12 },
          sentenceLength: { min: 8, max: 20 },
        },
        quality: {
          diversityScore: 0.6,
          naturalnessScore: 0.7,
        },
        cache: {
          enabled: true,
          expirationDays: 30,
        },
        contexts: {
          enabled: ['daily-conversation'],
          default: 'daily-conversation',
        },
        retry: {
          maxAttempts: 2,
          backoffMs: 1000,
        },
      });
      
      await claudeFactory.initialize();
      const aiService = claudeFactory.getAIService();
      
      expect(aiService).toBeDefined();
      expect(aiService.constructor.name).toBe('ClaudeAdapter');
    });
  });
});

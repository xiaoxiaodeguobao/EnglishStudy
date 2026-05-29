/**
 * Unit Tests for Configuration Types
 * 
 * Tests the configuration interfaces and default values
 * 
 * **Validates: Requirements 10.1, 10.2**
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONFIG,
  type ExampleServiceConfig,
  type AIProviderConfig,
  type GenerationParametersConfig,
  type QualityThresholdsConfig,
  type CacheConfig,
  type ContextConfig,
  type RetryConfig,
} from './types';

describe('Configuration Types', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have valid AI provider configuration', () => {
      expect(DEFAULT_CONFIG.aiProvider).toBe('openai');
      expect(DEFAULT_CONFIG.aiConfig).toBeDefined();
      expect(DEFAULT_CONFIG.aiConfig.model).toBe('gpt-3.5-turbo');
      expect(DEFAULT_CONFIG.aiConfig.apiUrl).toBe('https://api.openai.com/v1');
      expect(DEFAULT_CONFIG.aiConfig.maxRetries).toBe(2);
      expect(DEFAULT_CONFIG.aiConfig.timeout).toBe(30000);
    });

    it('should have valid generation parameters', () => {
      expect(DEFAULT_CONFIG.generation).toBeDefined();
      expect(DEFAULT_CONFIG.generation.exampleCount.min).toBe(10);
      expect(DEFAULT_CONFIG.generation.exampleCount.max).toBe(15);
      expect(DEFAULT_CONFIG.generation.exampleCount.default).toBe(12);
      expect(DEFAULT_CONFIG.generation.sentenceLength.min).toBe(8);
      expect(DEFAULT_CONFIG.generation.sentenceLength.max).toBe(20);
    });

    it('should have valid quality thresholds', () => {
      expect(DEFAULT_CONFIG.quality).toBeDefined();
      expect(DEFAULT_CONFIG.quality.diversityScore).toBe(0.6);
      expect(DEFAULT_CONFIG.quality.naturalnessScore).toBe(0.7);
    });

    it('should have valid cache configuration', () => {
      expect(DEFAULT_CONFIG.cache).toBeDefined();
      expect(DEFAULT_CONFIG.cache.enabled).toBe(true);
      expect(DEFAULT_CONFIG.cache.expirationDays).toBe(30);
    });

    it('should have valid context configuration', () => {
      expect(DEFAULT_CONFIG.contexts).toBeDefined();
      expect(DEFAULT_CONFIG.contexts.enabled).toHaveLength(5);
      expect(DEFAULT_CONFIG.contexts.enabled).toContain('daily-conversation');
      expect(DEFAULT_CONFIG.contexts.enabled).toContain('business-communication');
      expect(DEFAULT_CONFIG.contexts.enabled).toContain('academic-writing');
      expect(DEFAULT_CONFIG.contexts.enabled).toContain('technical-documentation');
      expect(DEFAULT_CONFIG.contexts.enabled).toContain('literary-expression');
      expect(DEFAULT_CONFIG.contexts.default).toBe('daily-conversation');
    });

    it('should have valid retry configuration', () => {
      expect(DEFAULT_CONFIG.retry).toBeDefined();
      expect(DEFAULT_CONFIG.retry.maxAttempts).toBe(2);
      expect(DEFAULT_CONFIG.retry.backoffMs).toBe(1000);
    });

    it('should have default context in enabled contexts list', () => {
      expect(DEFAULT_CONFIG.contexts.enabled).toContain(
        DEFAULT_CONFIG.contexts.default
      );
    });

    it('should have example count default within min/max range', () => {
      const { min, max, default: defaultCount } = DEFAULT_CONFIG.generation.exampleCount;
      expect(defaultCount).toBeGreaterThanOrEqual(min);
      expect(defaultCount).toBeLessThanOrEqual(max);
    });

    it('should have sentence length max greater than min', () => {
      const { min, max } = DEFAULT_CONFIG.generation.sentenceLength;
      expect(max).toBeGreaterThan(min);
    });

    it('should have quality scores between 0 and 1', () => {
      expect(DEFAULT_CONFIG.quality.diversityScore).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_CONFIG.quality.diversityScore).toBeLessThanOrEqual(1);
      expect(DEFAULT_CONFIG.quality.naturalnessScore).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_CONFIG.quality.naturalnessScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Type Definitions', () => {
    it('should allow valid AIProviderConfig', () => {
      const config: AIProviderConfig = {
        apiKey: 'test-key',
        model: 'gpt-4',
        apiUrl: 'https://api.example.com',
        maxRetries: 3,
        timeout: 60000,
      };

      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('gpt-4');
      expect(config.apiUrl).toBe('https://api.example.com');
      expect(config.maxRetries).toBe(3);
      expect(config.timeout).toBe(60000);
    });

    it('should allow valid GenerationParametersConfig', () => {
      const config: GenerationParametersConfig = {
        exampleCount: {
          min: 5,
          max: 20,
          default: 10,
        },
        sentenceLength: {
          min: 5,
          max: 30,
        },
      };

      expect(config.exampleCount.min).toBe(5);
      expect(config.exampleCount.max).toBe(20);
      expect(config.exampleCount.default).toBe(10);
      expect(config.sentenceLength.min).toBe(5);
      expect(config.sentenceLength.max).toBe(30);
    });

    it('should allow valid QualityThresholdsConfig', () => {
      const config: QualityThresholdsConfig = {
        diversityScore: 0.8,
        naturalnessScore: 0.75,
      };

      expect(config.diversityScore).toBe(0.8);
      expect(config.naturalnessScore).toBe(0.75);
    });

    it('should allow valid CacheConfig', () => {
      const config: CacheConfig = {
        enabled: false,
        expirationDays: 60,
      };

      expect(config.enabled).toBe(false);
      expect(config.expirationDays).toBe(60);
    });

    it('should allow valid ContextConfig', () => {
      const config: ContextConfig = {
        enabled: ['daily-conversation', 'business-communication'],
        default: 'daily-conversation',
      };

      expect(config.enabled).toHaveLength(2);
      expect(config.default).toBe('daily-conversation');
    });

    it('should allow valid RetryConfig', () => {
      const config: RetryConfig = {
        maxAttempts: 5,
        backoffMs: 2000,
      };

      expect(config.maxAttempts).toBe(5);
      expect(config.backoffMs).toBe(2000);
    });

    it('should allow valid ExampleServiceConfig with OpenAI', () => {
      const config: ExampleServiceConfig = {
        aiProvider: 'openai',
        aiConfig: {
          apiKey: 'test-key',
          model: 'gpt-4',
          apiUrl: 'https://api.openai.com/v1',
          maxRetries: 3,
          timeout: 60000,
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
          enabled: ['daily-conversation', 'business-communication'],
          default: 'daily-conversation',
        },
        retry: {
          maxAttempts: 2,
          backoffMs: 1000,
        },
      };

      expect(config.aiProvider).toBe('openai');
      expect(config.aiConfig.model).toBe('gpt-4');
    });

    it('should allow valid ExampleServiceConfig with Claude', () => {
      const config: ExampleServiceConfig = {
        aiProvider: 'claude',
        aiConfig: {
          apiKey: 'test-key',
          model: 'claude-3-sonnet',
          apiUrl: 'https://api.anthropic.com',
          maxRetries: 3,
          timeout: 60000,
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
          enabled: ['daily-conversation', 'business-communication'],
          default: 'daily-conversation',
        },
        retry: {
          maxAttempts: 2,
          backoffMs: 1000,
        },
      };

      expect(config.aiProvider).toBe('claude');
      expect(config.aiConfig.model).toBe('claude-3-sonnet');
    });
  });

  describe('Configuration Validation', () => {
    it('should have all required fields in ExampleServiceConfig', () => {
      const config = DEFAULT_CONFIG;

      // Check all top-level fields exist
      expect(config).toHaveProperty('aiProvider');
      expect(config).toHaveProperty('aiConfig');
      expect(config).toHaveProperty('generation');
      expect(config).toHaveProperty('quality');
      expect(config).toHaveProperty('cache');
      expect(config).toHaveProperty('contexts');
      expect(config).toHaveProperty('retry');
    });

    it('should have all required fields in AIProviderConfig', () => {
      const config = DEFAULT_CONFIG.aiConfig;

      expect(config).toHaveProperty('apiKey');
      expect(config).toHaveProperty('model');
      expect(config).toHaveProperty('apiUrl');
      expect(config).toHaveProperty('maxRetries');
      expect(config).toHaveProperty('timeout');
    });

    it('should have all required fields in GenerationParametersConfig', () => {
      const config = DEFAULT_CONFIG.generation;

      expect(config).toHaveProperty('exampleCount');
      expect(config.exampleCount).toHaveProperty('min');
      expect(config.exampleCount).toHaveProperty('max');
      expect(config.exampleCount).toHaveProperty('default');
      expect(config).toHaveProperty('sentenceLength');
      expect(config.sentenceLength).toHaveProperty('min');
      expect(config.sentenceLength).toHaveProperty('max');
    });

    it('should have all required fields in QualityThresholdsConfig', () => {
      const config = DEFAULT_CONFIG.quality;

      expect(config).toHaveProperty('diversityScore');
      expect(config).toHaveProperty('naturalnessScore');
    });

    it('should have all required fields in CacheConfig', () => {
      const config = DEFAULT_CONFIG.cache;

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('expirationDays');
    });

    it('should have all required fields in ContextConfig', () => {
      const config = DEFAULT_CONFIG.contexts;

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('default');
    });

    it('should have all required fields in RetryConfig', () => {
      const config = DEFAULT_CONFIG.retry;

      expect(config).toHaveProperty('maxAttempts');
      expect(config).toHaveProperty('backoffMs');
    });
  });
});

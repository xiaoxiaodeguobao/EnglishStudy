/**
 * Integration Tests for Configuration Module
 * 
 * Tests that configuration types and values are properly exported
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
} from './index';

describe('Configuration Module Exports', () => {
  it('should export DEFAULT_CONFIG', () => {
    expect(DEFAULT_CONFIG).toBeDefined();
    expect(DEFAULT_CONFIG.aiProvider).toBe('openai');
  });

  it('should export ExampleServiceConfig type', () => {
    const config: ExampleServiceConfig = DEFAULT_CONFIG;
    expect(config).toBeDefined();
  });

  it('should export AIProviderConfig type', () => {
    const config: AIProviderConfig = DEFAULT_CONFIG.aiConfig;
    expect(config).toBeDefined();
  });

  it('should export GenerationParametersConfig type', () => {
    const config: GenerationParametersConfig = DEFAULT_CONFIG.generation;
    expect(config).toBeDefined();
  });

  it('should export QualityThresholdsConfig type', () => {
    const config: QualityThresholdsConfig = DEFAULT_CONFIG.quality;
    expect(config).toBeDefined();
  });

  it('should export CacheConfig type', () => {
    const config: CacheConfig = DEFAULT_CONFIG.cache;
    expect(config).toBeDefined();
  });

  it('should export ContextConfig type', () => {
    const config: ContextConfig = DEFAULT_CONFIG.contexts;
    expect(config).toBeDefined();
  });

  it('should export RetryConfig type', () => {
    const config: RetryConfig = DEFAULT_CONFIG.retry;
    expect(config).toBeDefined();
  });
});

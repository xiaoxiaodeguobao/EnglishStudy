/**
 * ConfigManager Unit Tests
 * 
 * Tests for configuration loading, validation, merging, and updating.
 * 
 * **Validates: Requirements 10.1, 10.2, 10.5, 10.6**
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManagerImpl } from './ConfigManager';
import { ExampleServiceConfig, DEFAULT_CONFIG } from './types';
import * as envConfigModule from '../utils/envConfig';

// Mock the envConfig module
vi.mock('../utils/envConfig', () => ({
  getEnvConfig: vi.fn(),
  ValidationResult: {},
}));

describe('ConfigManager', () => {
  let configManager: ConfigManagerImpl;

  beforeEach(() => {
    configManager = new ConfigManagerImpl();
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load configuration from environment variables', async () => {
      // Requirement 10.1: Read configuration from environment
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-test-key',
          model: 'gpt-4',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: '',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      const config = await configManager.loadConfig();

      expect(config.aiProvider).toBe('openai');
      expect(config.aiConfig.apiKey).toBe('sk-test-key');
      expect(config.aiConfig.model).toBe('gpt-4');
      expect(config.aiConfig.maxRetries).toBe(3);
      expect(config.aiConfig.timeout).toBe(30000);
    });

    it('should merge environment config with defaults', async () => {
      // Requirement 10.5: Merge environment config with defaults
      const mockEnvConfig = {
        aiProvider: 'claude' as const,
        openai: {
          apiKey: '',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: 'sk-ant-test-key',
          model: 'claude-3-sonnet-20240229',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 2,
        apiTimeout: 20000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      const config = await configManager.loadConfig();

      // Environment values should override defaults
      expect(config.aiProvider).toBe('claude');
      expect(config.aiConfig.apiKey).toBe('sk-ant-test-key');
      expect(config.aiConfig.model).toBe('claude-3-sonnet-20240229');

      // Default values should be preserved
      expect(config.generation.exampleCount.default).toBe(12);
      expect(config.quality.diversityScore).toBe(0.6);
      expect(config.cache.enabled).toBe(true);
    });

    it('should use default configuration when environment loading fails', async () => {
      // Requirement 10.5: Use default configuration when file not found
      vi.mocked(envConfigModule.getEnvConfig).mockImplementation(() => {
        throw new Error('Environment config not available');
      });

      const config = await configManager.loadConfig();

      expect(config).toEqual(DEFAULT_CONFIG);
    });

    it('should validate configuration after loading', async () => {
      // Requirement 10.6: Validate configuration on startup
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-test-key',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: '',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      const config = await configManager.loadConfig();

      // Should not throw error for valid config
      expect(config).toBeDefined();
      expect(config.aiConfig.apiKey).toBe('sk-test-key');
    });
  });

  describe('validateConfig', () => {
    it('should validate AI provider', () => {
      // Requirement 10.6: Validate configuration
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        aiProvider: 'invalid' as any,
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid AI provider: invalid');
    });

    it('should require AI API key', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        aiConfig: {
          ...DEFAULT_CONFIG.aiConfig,
          apiKey: '',
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AI API key is required');
    });

    it('should require AI model', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        aiConfig: {
          ...DEFAULT_CONFIG.aiConfig,
          model: '',
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AI model is required');
    });

    it('should require valid AI API URL', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        aiConfig: {
          ...DEFAULT_CONFIG.aiConfig,
          apiUrl: '',
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('AI API URL is required');
    });

    it('should validate API URL format', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        aiConfig: {
          ...DEFAULT_CONFIG.aiConfig,
          apiUrl: 'invalid-url',
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'AI API URL must be a valid HTTP/HTTPS URL'
      );
    });

    it('should validate example count ranges', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        generation: {
          ...DEFAULT_CONFIG.generation,
          exampleCount: {
            min: 0,
            max: 15,
            default: 12,
          },
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Minimum example count must be at least 1'
      );
    });

    it('should validate max greater than min for example count', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        generation: {
          ...DEFAULT_CONFIG.generation,
          exampleCount: {
            min: 15,
            max: 10,
            default: 12,
          },
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Maximum example count must be greater than minimum'
      );
    });

    it('should warn if default example count is outside range', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        generation: {
          ...DEFAULT_CONFIG.generation,
          exampleCount: {
            min: 10,
            max: 15,
            default: 20,
          },
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.warnings).toContain(
        'Default example count is outside min/max range'
      );
    });

    it('should validate sentence length ranges', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        generation: {
          ...DEFAULT_CONFIG.generation,
          sentenceLength: {
            min: 0,
            max: 20,
          },
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Minimum sentence length must be at least 1'
      );
    });

    it('should validate quality thresholds are between 0 and 1', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        quality: {
          diversityScore: 1.5,
          naturalnessScore: -0.1,
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Diversity score threshold must be between 0 and 1'
      );
      expect(result.errors).toContain(
        'Naturalness score threshold must be between 0 and 1'
      );
    });

    it('should validate at least one context is enabled', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        contexts: {
          ...DEFAULT_CONFIG.contexts,
          enabled: [],
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one context must be enabled');
    });

    it('should validate default context is in enabled list', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        contexts: {
          enabled: ['daily-conversation'],
          default: 'business-communication' as any,
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Default context must be in enabled contexts list'
      );
    });

    it('should validate retry configuration', () => {
      const invalidConfig = {
        ...DEFAULT_CONFIG,
        retry: {
          maxAttempts: -1,
          backoffMs: -500,
        },
      };

      const result = configManager.validateConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Max retry attempts must be non-negative');
      expect(result.errors).toContain('Retry backoff must be non-negative');
    });

    it('should return valid for correct configuration', () => {
      const validConfig = {
        ...DEFAULT_CONFIG,
        aiConfig: {
          ...DEFAULT_CONFIG.aiConfig,
          apiKey: 'sk-test-key',
        },
      };

      const result = configManager.validateConfig(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getConfig', () => {
    it('should throw error if config not loaded', () => {
      // Requirement 10.1: Provide access to configuration
      expect(() => configManager.getConfig()).toThrow(
        'Configuration not loaded. Call loadConfig() first.'
      );
    });

    it('should return loaded configuration', async () => {
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-test-key',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: '',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      await configManager.loadConfig();
      const config = configManager.getConfig();

      expect(config).toBeDefined();
      expect(config.aiProvider).toBe('openai');
    });
  });

  describe('updateConfig', () => {
    it('should throw error if config not loaded', async () => {
      await expect(
        configManager.updateConfig({ aiProvider: 'claude' })
      ).rejects.toThrow('Configuration not loaded. Call loadConfig() first.');
    });

    it('should update configuration with valid updates', async () => {
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-test-key',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: 'sk-ant-test',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      await configManager.loadConfig();

      await configManager.updateConfig({
        aiProvider: 'claude',
        aiConfig: {
          apiKey: 'sk-ant-new-key',
          model: 'claude-3-sonnet-20240229',
          apiUrl: 'https://api.anthropic.com/v1',
          maxRetries: 2,
          timeout: 20000,
        },
      });

      const config = configManager.getConfig();
      expect(config.aiProvider).toBe('claude');
      expect(config.aiConfig.apiKey).toBe('sk-ant-new-key');
      expect(config.aiConfig.model).toBe('claude-3-sonnet-20240229');
    });

    it('should reject invalid configuration updates', async () => {
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-test-key',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: '',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      await configManager.loadConfig();

      await expect(
        configManager.updateConfig({
          aiConfig: {
            apiKey: '',
            model: '',
            apiUrl: '',
            maxRetries: 0,
            timeout: 0,
          },
        })
      ).rejects.toThrow('Invalid configuration updates');
    });

    it('should preserve unmodified configuration values', async () => {
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-test-key',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: '',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      await configManager.loadConfig();
      const originalConfig = configManager.getConfig();

      await configManager.updateConfig({
        cache: {
          enabled: false,
          expirationDays: 60,
        },
      });

      const updatedConfig = configManager.getConfig();

      // Updated values
      expect(updatedConfig.cache.enabled).toBe(false);
      expect(updatedConfig.cache.expirationDays).toBe(60);

      // Preserved values
      expect(updatedConfig.aiProvider).toBe(originalConfig.aiProvider);
      expect(updatedConfig.generation).toEqual(originalConfig.generation);
      expect(updatedConfig.quality).toEqual(originalConfig.quality);
    });
  });

  describe('AI provider switching', () => {
    it('should support switching from OpenAI to Claude', async () => {
      // Requirement 10.2: Support switching AI service implementations
      const mockEnvConfig = {
        aiProvider: 'openai' as const,
        openai: {
          apiKey: 'sk-openai-key',
          model: 'gpt-3.5-turbo',
          apiUrl: 'https://api.openai.com/v1',
        },
        claude: {
          apiKey: 'sk-ant-claude-key',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
        },
        dictionaryApiUrl: 'https://api.dictionaryapi.dev/api/v2',
        maxApiRetries: 3,
        apiTimeout: 30000,
        debugMode: false,
      };

      vi.mocked(envConfigModule.getEnvConfig).mockReturnValue(mockEnvConfig);

      await configManager.loadConfig();
      expect(configManager.getConfig().aiProvider).toBe('openai');

      // Switch to Claude
      await configManager.updateConfig({
        aiProvider: 'claude',
        aiConfig: {
          apiKey: 'sk-ant-claude-key',
          model: 'claude-3-haiku-20240307',
          apiUrl: 'https://api.anthropic.com/v1',
          maxRetries: 3,
          timeout: 30000,
        },
      });

      const config = configManager.getConfig();
      expect(config.aiProvider).toBe('claude');
      expect(config.aiConfig.apiKey).toBe('sk-ant-claude-key');
    });
  });
});

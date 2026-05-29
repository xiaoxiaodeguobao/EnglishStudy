/**
 * Configuration Manager
 * 
 * Centralized configuration management for the enhanced example sentence service.
 * Loads configuration from environment variables, validates it, and merges with defaults.
 * 
 * **Validates: Requirements 10.1, 10.2, 10.5, 10.6**
 */

import { getEnvConfig, ValidationResult } from '../utils/envConfig';
import {
  ExampleServiceConfig,
  DEFAULT_CONFIG,
  AIProviderConfig,
} from './types';

/**
 * Configuration Manager Interface
 * 
 * Requirement 10.1: Read all parameters from configuration
 * Requirement 10.2: Support switching AI service implementations
 * Requirement 10.5: Use default configuration when file not found
 * Requirement 10.6: Validate configuration on startup
 */
export interface ConfigManager {
  /**
   * Load configuration from environment variables
   * Merges environment config with defaults
   */
  loadConfig(): Promise<ExampleServiceConfig>;

  /**
   * Validate configuration with comprehensive validation rules
   */
  validateConfig(config: ExampleServiceConfig): ValidationResult;

  /**
   * Get current configuration
   * Throws error if configuration not loaded
   */
  getConfig(): ExampleServiceConfig;

  /**
   * Update configuration with partial updates
   * Validates before applying changes
   */
  updateConfig(updates: Partial<ExampleServiceConfig>): Promise<void>;
}

/**
 * Configuration Manager Implementation
 * 
 * Provides centralized configuration management with validation,
 * environment variable loading, and default value merging.
 */
export class ConfigManagerImpl implements ConfigManager {
  private config: ExampleServiceConfig | null = null;
  private readonly defaultConfig: ExampleServiceConfig = DEFAULT_CONFIG;

  /**
   * Load configuration from environment variables
   * 
   * Requirement 10.1: Read all parameters from configuration
   * Requirement 10.5: Use default configuration when file not found
   * Requirement 10.6: Validate configuration on startup
   */
  async loadConfig(): Promise<ExampleServiceConfig> {
    try {
      // Load from environment variables
      const envConfig = this.loadFromEnvironment();

      // Merge with defaults
      this.config = this.mergeConfigs(this.defaultConfig, envConfig);

      // Validate
      const validation = this.validateConfig(this.config);
      if (!validation.isValid) {
        console.error('Configuration validation failed', {
          errors: validation.errors,
        });
        throw new Error(
          `Invalid configuration: ${validation.errors.join(', ')}`
        );
      }

      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings', {
          warnings: validation.warnings,
        });
      }

      console.info('Configuration loaded successfully');
      return this.config;
    } catch (error) {
      console.error('Failed to load configuration, using defaults', { error });
      this.config = this.defaultConfig;
      return this.defaultConfig;
    }
  }

  /**
   * Validate configuration with comprehensive validation rules
   * 
   * Requirement 10.6: Validate configuration on startup and report errors
   */
  validateConfig(config: ExampleServiceConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate AI provider
    if (!['openai', 'claude', 'doubao', 'deepseek'].includes(config.aiProvider)) {
      errors.push(`Invalid AI provider: ${config.aiProvider}`);
    }

    // Validate AI config
    if (!config.aiConfig.apiKey) {
      errors.push('AI API key is required');
    }
    if (!config.aiConfig.model) {
      errors.push('AI model is required');
    }
    if (!config.aiConfig.apiUrl) {
      errors.push('AI API URL is required');
    }
    if (!config.aiConfig.apiUrl.startsWith('http')) {
      errors.push('AI API URL must be a valid HTTP/HTTPS URL');
    }

    // Validate AI config numeric values
    if (config.aiConfig.maxRetries < 0 || config.aiConfig.maxRetries > 10) {
      warnings.push('Max retries should be between 0 and 10');
    }
    if (config.aiConfig.timeout < 1000 || config.aiConfig.timeout > 120000) {
      warnings.push('API timeout should be between 1000ms and 120000ms');
    }

    // Validate example count
    if (config.generation.exampleCount.min < 1) {
      errors.push('Minimum example count must be at least 1');
    }
    if (
      config.generation.exampleCount.max < config.generation.exampleCount.min
    ) {
      errors.push('Maximum example count must be greater than minimum');
    }
    if (
      config.generation.exampleCount.default <
        config.generation.exampleCount.min ||
      config.generation.exampleCount.default >
        config.generation.exampleCount.max
    ) {
      warnings.push('Default example count is outside min/max range');
    }

    // Validate sentence length
    if (config.generation.sentenceLength.min < 1) {
      errors.push('Minimum sentence length must be at least 1');
    }
    if (
      config.generation.sentenceLength.max <
      config.generation.sentenceLength.min
    ) {
      errors.push('Maximum sentence length must be greater than minimum');
    }

    // Validate quality thresholds
    if (
      config.quality.diversityScore < 0 ||
      config.quality.diversityScore > 1
    ) {
      errors.push('Diversity score threshold must be between 0 and 1');
    }
    if (
      config.quality.naturalnessScore < 0 ||
      config.quality.naturalnessScore > 1
    ) {
      errors.push('Naturalness score threshold must be between 0 and 1');
    }

    // Validate cache configuration
    if (config.cache.expirationDays < 1) {
      warnings.push('Cache expiration should be at least 1 day');
    }

    // Validate contexts
    if (config.contexts.enabled.length === 0) {
      errors.push('At least one context must be enabled');
    }
    if (!config.contexts.enabled.includes(config.contexts.default)) {
      errors.push('Default context must be in enabled contexts list');
    }

    // Validate retry configuration
    if (config.retry.maxAttempts < 0) {
      errors.push('Max retry attempts must be non-negative');
    }
    if (config.retry.backoffMs < 0) {
      errors.push('Retry backoff must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get current configuration
   * 
   * Requirement 10.1: Provide access to configuration parameters
   */
  getConfig(): ExampleServiceConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  /**
   * Update configuration with partial updates
   * 
   * Validates before applying changes to ensure configuration remains valid
   */
  async updateConfig(
    updates: Partial<ExampleServiceConfig>
  ): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }

    const newConfig = this.mergeConfigs(this.config, updates);
    const validation = this.validateConfig(newConfig);

    if (!validation.isValid) {
      throw new Error(
        `Invalid configuration updates: ${validation.errors.join(', ')}`
      );
    }

    this.config = newConfig;
    console.info('Configuration updated', { updates });
  }

  /**
   * Load configuration from environment variables
   * 
   * Requirement 10.1: Read configuration from environment
   * Requirement 10.2: Support switching between AI providers
   */
  private loadFromEnvironment(): Partial<ExampleServiceConfig> {
    const envConfig = getEnvConfig();

    // Determine AI config based on selected provider
    let aiConfig: AIProviderConfig;
    
    if (envConfig.aiProvider === 'claude') {
      aiConfig = {
        apiKey: envConfig.claude.apiKey,
        model: envConfig.claude.model,
        apiUrl: envConfig.claude.apiUrl,
        maxRetries: envConfig.maxApiRetries,
        timeout: envConfig.apiTimeout,
      };
    } else if (envConfig.aiProvider === 'doubao') {
      aiConfig = {
        apiKey: envConfig.doubao.apiKey,
        model: envConfig.doubao.model,
        apiUrl: envConfig.doubao.apiUrl,
        maxRetries: envConfig.maxApiRetries,
        timeout: envConfig.apiTimeout,
      };
    } else if (envConfig.aiProvider === 'deepseek') {
      aiConfig = {
        apiKey: envConfig.deepseek.apiKey,
        model: envConfig.deepseek.model,
        apiUrl: envConfig.deepseek.apiUrl,
        maxRetries: envConfig.maxApiRetries,
        timeout: envConfig.apiTimeout,
      };
    } else {
      aiConfig = {
        apiKey: envConfig.openai.apiKey,
        model: envConfig.openai.model,
        apiUrl: envConfig.openai.apiUrl,
        maxRetries: envConfig.maxApiRetries,
        timeout: envConfig.apiTimeout,
      };
    }

    return {
      aiProvider: envConfig.aiProvider,
      aiConfig,
    };
  }

  /**
   * Merge configuration objects with deep merging for nested objects
   * 
   * Requirement 10.5: Merge environment config with defaults
   */
  private mergeConfigs(
    base: ExampleServiceConfig,
    updates: Partial<ExampleServiceConfig>
  ): ExampleServiceConfig {
    return {
      ...base,
      ...updates,
      aiConfig: {
        ...base.aiConfig,
        ...(updates.aiConfig || {}),
      },
      generation: {
        ...base.generation,
        ...(updates.generation || {}),
        exampleCount: {
          ...base.generation.exampleCount,
          ...(updates.generation?.exampleCount || {}),
        },
        sentenceLength: {
          ...base.generation.sentenceLength,
          ...(updates.generation?.sentenceLength || {}),
        },
      },
      quality: {
        ...base.quality,
        ...(updates.quality || {}),
      },
      cache: {
        ...base.cache,
        ...(updates.cache || {}),
      },
      contexts: {
        ...base.contexts,
        ...(updates.contexts || {}),
      },
      retry: {
        ...base.retry,
        ...(updates.retry || {}),
      },
    };
  }
}

/**
 * Create and export a singleton instance of ConfigManager
 */
export const configManager = new ConfigManagerImpl();

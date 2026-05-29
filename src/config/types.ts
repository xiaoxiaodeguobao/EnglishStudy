/**
 * Configuration Types for Enhanced Example Sentence Service
 * 
 * Defines configuration interfaces for the enhanced example sentence
 * generation system, including AI provider settings, generation parameters,
 * quality thresholds, cache configuration, and retry settings.
 * 
 * **Validates: Requirements 10.1, 10.2**
 */

import { ApplicationContext } from '../services/ai/types';

/**
 * AI Provider Configuration
 * 
 * Configuration for AI service providers (OpenAI or Claude)
 * 
 * Requirement 10.2: Support switching between AI service implementations
 */
export interface AIProviderConfig {
  /** API key for authentication */
  apiKey: string;
  /** Model identifier (e.g., 'gpt-3.5-turbo', 'claude-3-sonnet') */
  model: string;
  /** Base API URL */
  apiUrl: string;
  /** Maximum number of retry attempts on failure */
  maxRetries: number;
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Generation Parameters Configuration
 * 
 * Parameters controlling example sentence generation behavior
 * 
 * Requirement 10.1: Read generation parameters from configuration
 */
export interface GenerationParametersConfig {
  /** Example count configuration */
  exampleCount: {
    /** Minimum number of examples to generate */
    min: number;
    /** Maximum number of examples to generate */
    max: number;
    /** Default number of examples to generate */
    default: number;
  };
  /** Sentence length constraints */
  sentenceLength: {
    /** Minimum sentence length in words */
    min: number;
    /** Maximum sentence length in words */
    max: number;
  };
}

/**
 * Quality Thresholds Configuration
 * 
 * Minimum quality scores required for generated content
 * 
 * Requirement 10.1: Read quality thresholds from configuration
 */
export interface QualityThresholdsConfig {
  /** Minimum diversity score (0-1) for example sets */
  diversityScore: number;
  /** Minimum naturalness score (0-1) for individual examples */
  naturalnessScore: number;
}

/**
 * Cache Configuration
 * 
 * Settings for caching generated examples
 * 
 * Requirement 10.1: Read cache configuration from file
 */
export interface CacheConfig {
  /** Whether caching is enabled */
  enabled: boolean;
  /** Number of days before cached examples expire */
  expirationDays: number;
}

/**
 * Context Configuration
 * 
 * Settings for application context/scenario handling
 * 
 * Requirement 10.1: Read scenario type list from configuration
 */
export interface ContextConfig {
  /** List of enabled application contexts */
  enabled: ApplicationContext[];
  /** Default context to use when none specified */
  default: ApplicationContext;
}

/**
 * Retry Configuration
 * 
 * Settings for retry behavior on failures
 * 
 * Requirement 10.1: Read retry configuration from file
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Backoff delay in milliseconds between retries */
  backoffMs: number;
}

/**
 * Complete Example Service Configuration
 * 
 * Centralized configuration for the enhanced example sentence service
 * 
 * Requirement 10.1: Read all parameters from configuration file
 * Requirement 10.2: Support switching AI service implementations
 */
export interface ExampleServiceConfig {
  /** AI provider type ('openai', 'claude', 'doubao', or 'deepseek') */
  aiProvider: 'openai' | 'claude' | 'doubao' | 'deepseek';
  
  /** AI provider configuration */
  aiConfig: AIProviderConfig;
  
  /** Generation parameters */
  generation: GenerationParametersConfig;
  
  /** Quality thresholds */
  quality: QualityThresholdsConfig;
  
  /** Cache configuration */
  cache: CacheConfig;
  
  /** Context configuration */
  contexts: ContextConfig;
  
  /** Retry configuration */
  retry: RetryConfig;
}

/**
 * Default configuration values
 * 
 * Requirement 10.5: Use default configuration when file not found
 */
export const DEFAULT_CONFIG: ExampleServiceConfig = {
  aiProvider: 'openai',
  aiConfig: {
    apiKey: '',
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

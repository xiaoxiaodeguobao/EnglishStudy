/**
 * Configuration Module
 * 
 * Exports configuration types and default values for the
 * enhanced example sentence generation system.
 */

export type {
  AIProviderConfig,
  GenerationParametersConfig,
  QualityThresholdsConfig,
  CacheConfig,
  ContextConfig,
  RetryConfig,
  ExampleServiceConfig,
} from './types';

export { DEFAULT_CONFIG } from './types';

export type { ConfigManager } from './ConfigManager';
export { ConfigManagerImpl, configManager } from './ConfigManager';

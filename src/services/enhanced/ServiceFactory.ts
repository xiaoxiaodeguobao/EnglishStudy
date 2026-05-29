/**
 * Service Factory and Dependency Injection
 * 
 * Creates and wires together all enhanced example sentence service components
 * with proper dependency injection. Provides singleton instances for
 * application-wide use.
 * 
 * **Validates: Requirements 6.1, 6.2, 10.1, 10.2, 10.3**
 */

import { ConfigManagerImpl } from '../../config/ConfigManager';
import { OpenAIAdapter } from '../ai/OpenAIAdapter';
import { ClaudeAdapter } from '../ai/ClaudeAdapter';
import { ContextAnalyzerImpl } from '../context/ContextAnalyzer';
import { QualityAssessorImpl } from '../quality/QualityAssessor';
import { CacheManagerImpl } from '../cache/CacheManager';
import { storageService } from '../StorageService';
import { EnhancedExampleSentenceServiceImpl } from './EnhancedExampleSentenceService';
import { SentenceChainServiceImpl } from './SentenceChainService';

import type { AIService } from '../ai/types';
import type { ContextAnalyzer } from '../context/ContextAnalyzer';
import type { QualityAssessor } from '../quality/types';
import type { CacheManager } from '../cache/CacheManager';
import type {
  EnhancedExampleSentenceService,
  SentenceChainService,
} from './types';
import type { ExampleServiceConfig } from '../../config/types';

/**
 * Service Factory Interface
 * 
 * Provides methods to create and access service instances with
 * proper dependency injection.
 */
export interface ServiceFactory {
  /**
   * Initialize the factory and load configuration
   * Must be called before accessing any services
   */
  initialize(): Promise<void>;

  /**
   * Get the configured AI service instance
   */
  getAIService(): AIService;

  /**
   * Get the context analyzer instance
   */
  getContextAnalyzer(): ContextAnalyzer;

  /**
   * Get the quality assessor instance
   */
  getQualityAssessor(): QualityAssessor;

  /**
   * Get the cache manager instance
   */
  getCacheManager(): CacheManager;

  /**
   * Get the enhanced example sentence service instance
   */
  getEnhancedExampleSentenceService(): EnhancedExampleSentenceService;

  /**
   * Get the sentence chain service instance
   */
  getSentenceChainService(): SentenceChainService;

  /**
   * Get the current configuration
   */
  getConfig(): ExampleServiceConfig;
}

/**
 * Service Factory Implementation
 * 
 * Creates and manages singleton instances of all services with
 * proper dependency injection and configuration.
 * 
 * Requirement 6.1: Define AI service interface
 * Requirement 6.2: Support passing parameters to AI service
 * Requirement 10.1: Read all parameters from configuration
 * Requirement 10.2: Support switching AI service implementations
 * Requirement 10.3: Provide plugin interface for custom analyzers
 */
export class ServiceFactoryImpl implements ServiceFactory {
  private configManager: ConfigManagerImpl;
  private config: ExampleServiceConfig | null = null;
  private initialized = false;

  // Service instances (created lazily)
  private aiService: AIService | null = null;
  private contextAnalyzer: ContextAnalyzer | null = null;
  private qualityAssessor: QualityAssessor | null = null;
  private cacheManager: CacheManager | null = null;
  private enhancedExampleSentenceService: EnhancedExampleSentenceService | null = null;
  private sentenceChainService: SentenceChainService | null = null;

  constructor() {
    this.configManager = new ConfigManagerImpl();
  }

  /**
   * Initialize the factory and load configuration
   * 
   * Requirement 10.1: Read all parameters from configuration
   * Requirement 10.2: Support switching AI service implementations
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('ServiceFactory already initialized');
      return;
    }

    try {
      console.info('Initializing ServiceFactory...');

      // Load configuration
      this.config = await this.configManager.loadConfig();

      // Mark as initialized
      this.initialized = true;

      console.info('ServiceFactory initialized successfully', {
        aiProvider: this.config.aiProvider,
        cacheEnabled: this.config.cache.enabled,
        enabledContexts: this.config.contexts.enabled.length,
      });
    } catch (error) {
      console.error('Failed to initialize ServiceFactory', { error });
      throw new Error(
        `ServiceFactory initialization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get the configured AI service instance
   * 
   * Requirement 6.1: Define AI service interface
   * Requirement 6.2: Support passing parameters to AI service
   * Requirement 10.2: Support switching between AI providers
   */
  getAIService(): AIService {
    this.ensureInitialized();

    if (!this.aiService) {
      const config = this.getConfig();

      // Create AI service based on configured provider
      if (config.aiProvider === 'claude') {
        console.info('Creating Claude AI service adapter');
        this.aiService = new ClaudeAdapter(config.aiConfig);
      } else if (config.aiProvider === 'doubao') {
        console.info('Creating Doubao (豆包) AI service adapter (OpenAI-compatible)');
        this.aiService = new OpenAIAdapter(config.aiConfig);
      } else if (config.aiProvider === 'deepseek') {
        console.info('Creating DeepSeek AI service adapter (OpenAI-compatible)');
        this.aiService = new OpenAIAdapter(config.aiConfig);
      } else {
        console.info('Creating OpenAI AI service adapter');
        this.aiService = new OpenAIAdapter(config.aiConfig);
      }
    }

    return this.aiService;
  }

  /**
   * Get the context analyzer instance
   * 
   * Requirement 10.3: Provide plugin interface for custom analyzers
   */
  getContextAnalyzer(): ContextAnalyzer {
    this.ensureInitialized();

    if (!this.contextAnalyzer) {
      console.info('Creating ContextAnalyzer instance');
      const aiService = this.getAIService();
      this.contextAnalyzer = new ContextAnalyzerImpl(aiService);
    }

    return this.contextAnalyzer;
  }

  /**
   * Get the quality assessor instance
   * 
   * Requirement 10.3: Provide plugin interface for custom quality assessors
   */
  getQualityAssessor(): QualityAssessor {
    this.ensureInitialized();

    if (!this.qualityAssessor) {
      console.info('Creating QualityAssessor instance');
      const aiService = this.getAIService();
      this.qualityAssessor = new QualityAssessorImpl(aiService);
    }

    return this.qualityAssessor;
  }

  /**
   * Get the cache manager instance
   */
  getCacheManager(): CacheManager {
    this.ensureInitialized();

    if (!this.cacheManager) {
      const config = this.getConfig();
      console.info('Creating CacheManager instance', {
        enabled: config.cache.enabled,
        expirationDays: config.cache.expirationDays,
      });

      this.cacheManager = new CacheManagerImpl(
        storageService,
        config.cache.expirationDays
      );
    }

    return this.cacheManager;
  }

  /**
   * Get the enhanced example sentence service instance
   * 
   * Wires together all dependencies for the enhanced example sentence service
   */
  getEnhancedExampleSentenceService(): EnhancedExampleSentenceService {
    this.ensureInitialized();

    if (!this.enhancedExampleSentenceService) {
      console.info('Creating EnhancedExampleSentenceService instance');

      const aiService = this.getAIService();
      const contextAnalyzer = this.getContextAnalyzer();
      const qualityAssessor = this.getQualityAssessor();
      const cacheManager = this.getCacheManager();
      const config = this.getConfig();

      this.enhancedExampleSentenceService = new EnhancedExampleSentenceServiceImpl(
        aiService,
        contextAnalyzer,
        qualityAssessor,
        cacheManager,
        config
      );
    }

    return this.enhancedExampleSentenceService;
  }

  /**
   * Get the sentence chain service instance
   * 
   * Wires together all dependencies for the sentence chain service
   */
  getSentenceChainService(): SentenceChainService {
    this.ensureInitialized();

    if (!this.sentenceChainService) {
      console.info('Creating SentenceChainService instance');

      const aiService = this.getAIService();
      const contextAnalyzer = this.getContextAnalyzer();
      const qualityAssessor = this.getQualityAssessor();
      const cacheManager = this.getCacheManager();

      this.sentenceChainService = new SentenceChainServiceImpl(
        aiService,
        contextAnalyzer,
        qualityAssessor,
        cacheManager
      );
    }

    return this.sentenceChainService;
  }

  /**
   * Get the current configuration
   */
  getConfig(): ExampleServiceConfig {
    this.ensureInitialized();
    return this.config!;
  }

  /**
   * Ensure the factory has been initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error(
        'ServiceFactory not initialized. Call initialize() first.'
      );
    }
  }
}

/**
 * Singleton instance of the service factory
 * 
 * This provides a single point of access to all enhanced services
 * throughout the application.
 */
export const serviceFactory = new ServiceFactoryImpl();

/**
 * Initialize the service factory
 * 
 * This should be called once during application startup, before
 * any services are accessed.
 * 
 * @example
 * ```typescript
 * // In main.tsx or app initialization
 * await initializeServiceFactory();
 * ```
 */
export async function initializeServiceFactory(): Promise<void> {
  await serviceFactory.initialize();
}

/**
 * Get the enhanced example sentence service
 * 
 * Convenience function to access the service without going through
 * the factory directly.
 * 
 * @example
 * ```typescript
 * const service = getEnhancedExampleSentenceService();
 * const examples = await service.getExamplesWithCache('hello', 10);
 * ```
 */
export function getEnhancedExampleSentenceService(): EnhancedExampleSentenceService {
  return serviceFactory.getEnhancedExampleSentenceService();
}

/**
 * Get the sentence chain service
 * 
 * Convenience function to access the service without going through
 * the factory directly.
 * 
 * @example
 * ```typescript
 * const service = getSentenceChainService();
 * const chains = await service.getSentenceChainsWithCache(words, 5);
 * ```
 */
export function getSentenceChainService(): SentenceChainService {
  return serviceFactory.getSentenceChainService();
}

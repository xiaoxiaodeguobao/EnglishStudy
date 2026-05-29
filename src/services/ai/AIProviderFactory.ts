/**
 * AI Provider Factory
 *
 * Creates the appropriate AI service adapter based on the configured provider.
 * Supports openai, claude, deepseek, and doubao providers.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
 */

import type { EnvConfig } from '../../utils/envConfig';
import type { AIService, AIServiceConfig } from './types';
import { OpenAIAdapter } from './OpenAIAdapter';
import { ClaudeAdapter } from './ClaudeAdapter';
import { DeepSeekAdapter } from './DeepSeekAdapter';
import { DoubaoAdapter } from './DoubaoAdapter';

/**
 * Supported AI provider identifiers
 * Requirement 6.1: Factory supports openai, claude, deepseek, doubao
 */
export type SupportedProvider = 'openai' | 'claude' | 'deepseek' | 'doubao';

/**
 * List of all supported provider names, used in error messages
 */
const SUPPORTED_PROVIDERS: SupportedProvider[] = ['openai', 'claude', 'deepseek', 'doubao'];

/**
 * Create an AI service adapter for the given provider
 *
 * Reads provider-specific configuration (apiKey, model, apiUrl) from the
 * supplied EnvConfig, and uses the global maxRetries / apiTimeout values.
 *
 * Requirement 6.1: Return correct adapter based on provider value
 * Requirement 6.2: Return DeepSeekAdapter when provider is 'deepseek'
 * Requirement 6.3: Return DoubaoAdapter when provider is 'doubao'
 * Requirement 6.4: WordGeneratorService gets adapter through this factory
 * Requirement 6.5: Throw error with supported list for unknown providers
 *
 * @param provider - The provider identifier (e.g. 'openai', 'deepseek')
 * @param config   - Environment configuration containing per-provider settings
 * @returns An AIService instance configured for the requested provider
 * @throws Error when provider is not in the supported list
 */
export function createAIProvider(provider: string, config: EnvConfig): AIService {
  const sharedConfig = {
    maxRetries: config.maxApiRetries,
    timeout: config.apiTimeout,
  };

  switch (provider) {
    case 'openai': {
      const serviceConfig: AIServiceConfig = {
        apiKey: config.openai.apiKey,
        model: config.openai.model,
        apiUrl: config.openai.apiUrl,
        ...sharedConfig,
      };
      return new OpenAIAdapter(serviceConfig);
    }

    case 'claude': {
      const serviceConfig: AIServiceConfig = {
        apiKey: config.claude.apiKey,
        model: config.claude.model,
        apiUrl: config.claude.apiUrl,
        ...sharedConfig,
      };
      return new ClaudeAdapter(serviceConfig);
    }

    case 'deepseek': {
      const serviceConfig: AIServiceConfig = {
        apiKey: config.deepseek.apiKey,
        model: config.deepseek.model,
        apiUrl: config.deepseek.apiUrl,
        ...sharedConfig,
      };
      return new DeepSeekAdapter(serviceConfig);
    }

    case 'doubao': {
      const serviceConfig: AIServiceConfig = {
        apiKey: config.doubao.apiKey,
        model: config.doubao.model,
        apiUrl: config.doubao.apiUrl,
        ...sharedConfig,
      };
      return new DoubaoAdapter(serviceConfig);
    }

    default:
      throw new Error(
        `不支持的 AI 提供商: "${provider}"。支持的提供商: ${SUPPORTED_PROVIDERS.join(', ')}`
      );
  }
}

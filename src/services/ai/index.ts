/**
 * AI Service Module
 * 
 * Exports AI service types and interfaces for use throughout the application.
 */

export {
  type ApplicationContext,
  type AIServiceConfig,
  type AIGenerationRequest,
  type AIGenerationResponse,
  type AIService,
  AIServiceError,
  type WordListGenerationRequest,
  type WordListGenerationResponse,
  type RawWordData,
  type RawAssociationData,
  type RawSentenceChainData,
} from './types';

export { OpenAIAdapter } from './OpenAIAdapter';
export { ClaudeAdapter } from './ClaudeAdapter';
export { DeepSeekAdapter } from './DeepSeekAdapter';
export { DoubaoAdapter } from './DoubaoAdapter';
export { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

export { createAIProvider, type SupportedProvider } from './AIProviderFactory';

export {
  withRetry,
  createRetryWrapper,
  RetryExhaustedError,
  type RetryOptions,
  type RetryResult,
} from './RetryHandler';

export {
  extractJSON,
  validateAndFilterWords,
  normalizeAssociationType,
  resolveAssociationIds,
  filterValidSentenceChainWords,
} from './WordListResponseParser';

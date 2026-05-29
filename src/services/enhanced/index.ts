/**
 * Enhanced Services Index
 * 
 * Central export point for enhanced example sentence service types and implementations.
 */

export type {
  EnhancedExampleSentence,
  ExampleGenerationOptions,
  ExampleGenerationResult,
  EnhancedExampleSentenceService,
  EnhancedSentenceChain,
  SentenceChainGenerationOptions,
  SentenceChainService,
} from './types';

export { EnhancedExampleSentenceServiceImpl } from './EnhancedExampleSentenceService';
export { SentenceChainServiceImpl } from './SentenceChainService';

// Service Factory exports
export {
  type ServiceFactory,
  ServiceFactoryImpl,
  serviceFactory,
  initializeServiceFactory,
  getEnhancedExampleSentenceService,
  getSentenceChainService,
} from './ServiceFactory';

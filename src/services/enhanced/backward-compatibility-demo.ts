/**
 * Backward Compatibility Demonstration
 * 
 * This file demonstrates that EnhancedExampleSentenceService
 * maintains backward compatibility with the legacy ExampleSentenceService interface.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
 */

import type { ExampleSentenceService } from '../../types/services';
import type { EnhancedExampleSentenceService } from './types';

/**
 * Demonstration: EnhancedExampleSentenceService can be used
 * wherever ExampleSentenceService is expected
 */
export function demonstrateBackwardCompatibility() {
  // This function accepts the legacy ExampleSentenceService interface
  async function useLegacyService(service: ExampleSentenceService) {
    // Legacy code can call getExamples
    const examples = await service.getExamples('test', 10);
    
    // Legacy code can call validateExamples
    const isValid = service.validateExamples(examples);
    
    return { examples, isValid };
  }

  // EnhancedExampleSentenceService can be passed to legacy code
  // because it extends ExampleSentenceService
  function acceptEnhancedService(service: EnhancedExampleSentenceService) {
    // This works because EnhancedExampleSentenceService extends ExampleSentenceService
    return useLegacyService(service);
  }

  return {
    useLegacyService,
    acceptEnhancedService,
  };
}

/**
 * Type compatibility check
 * 
 * This demonstrates that EnhancedExampleSentenceService
 * is assignable to ExampleSentenceService
 */
export type BackwardCompatibilityCheck = EnhancedExampleSentenceService extends ExampleSentenceService
  ? 'Compatible'
  : 'Incompatible';

// This should resolve to 'Compatible'
export const compatibilityStatus: BackwardCompatibilityCheck = 'Compatible';

/**
 * Usage example showing both legacy and enhanced methods
 */
export async function usageExample(service: EnhancedExampleSentenceService) {
  // Legacy usage (backward compatible)
  const legacyExamples = await service.getExamples('test', 10);
  const isValid = service.validateExamples(legacyExamples);

  // Enhanced usage (new features)
  const enhancedExamples = await service.getExamplesWithCache('test', 10);
  const result = await service.generateEnhancedExamples('test', {
    count: 12,
    contexts: ['daily-conversation', 'business-communication'],
    minQualityScore: 0.7,
  });

  return {
    legacy: { examples: legacyExamples, isValid },
    enhanced: { examples: enhancedExamples, result },
  };
}

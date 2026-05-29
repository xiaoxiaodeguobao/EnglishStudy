/**
 * useExampleSentences Hook
 * 
 * React Query hook for fetching and caching example sentences from enhanced AI service.
 * Uses EnhancedExampleSentenceService with built-in caching (30-day expiration).
 * 
 * The hook returns EnhancedExampleSentence[] which includes:
 * - Base fields: sentence, translation, highlightWord
 * - Enhanced fields: context, diversityScore, naturalnessScore, metadata
 * 
 * For backward compatibility, components can use the base fields only.
 * 
 * Requirements: 1.1, 1.2, 1.3, 7.1, 7.2
 */

import { useQuery } from '@tanstack/react-query';
import { exampleSentenceService } from '../services';
import type { ExampleSentence } from '../types';
import type { EnhancedExampleSentence } from '../services/enhanced/types';

/**
 * Check if the service supports enhanced features
 * This allows gradual migration to EnhancedExampleSentenceService
 */
function isEnhancedService(
  service: any
): service is { getExamplesWithCache: (word: string, count: number) => Promise<EnhancedExampleSentence[]> } {
  return typeof service.getExamplesWithCache === 'function';
}

/**
 * Fetch example sentences with caching
 * 
 * This hook uses the enhanced service's getExamplesWithCache method when available,
 * which provides:
 * - 30-day persistent caching (vs. 1-hour React Query cache)
 * - Context-aware examples (daily, business, academic, technical, literary)
 * - Quality scoring (diversity and naturalness)
 * - AI-generated natural sentences (no templates)
 * 
 * Falls back to legacy getExamples method for backward compatibility.
 * 
 * @param word - The word to fetch examples for
 * @param count - Number of examples to fetch (10-15)
 * @param options - Query options
 * @returns Query result with enhanced examples, loading state, and error
 * 
 * Requirements:
 * - 1.1: Context-aware example generation
 * - 1.2: Multiple examples per context
 * - 1.3: Multiple context coverage
 * - 7.1: Persistent caching
 * - 7.2: Cache-first strategy
 */
export function useExampleSentences(
  word: string,
  count: number = 12,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<EnhancedExampleSentence[] | ExampleSentence[], Error>({
    queryKey: ['exampleSentences', word.toLowerCase(), count],
    queryFn: async () => {
      // Use enhanced service with cache if available
      // Requirement 7.2: Check cache first, generate on miss
      if (isEnhancedService(exampleSentenceService)) {
        return exampleSentenceService.getExamplesWithCache(word, count);
      }
      
      // Fallback to legacy service for backward compatibility
      // This ensures the hook works even if enhanced service isn't wired up yet
      const legacyExamples = await exampleSentenceService.getExamples(word, count);
      
      // Convert to enhanced format for consistent return type
      // This allows components to always expect EnhancedExampleSentence[]
      return legacyExamples.map((ex) => ({
        ...ex,
        context: 'daily-conversation' as const,
        diversityScore: undefined,
        naturalnessScore: undefined,
        metadata: {
          generatedAt: new Date(),
          model: 'legacy',
          tokensUsed: 0,
        },
      })) as EnhancedExampleSentence[];
    },
    
    // Enhanced service has 30-day cache, so React Query cache can be longer
    // Requirement 7.1: Cache examples in local storage with 30-day expiration
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    
    // Only fetch if word is provided and enabled
    enabled: !!word && (options?.enabled !== false),
    
    // Retry on failure (enhanced service has built-in retry logic)
    retry: 1,
  });
}

/**
 * useWordDefinitions Hook
 * 
 * React Query hook for fetching and caching word definitions from Dictionary API.
 * Definitions are cached for 24 hours since they don't change.
 * 
 * Requirements: 10.4
 */

import { useQuery } from '@tanstack/react-query';
import { dictionaryService } from '../services';
import type { WordDefinition } from '../types';

/**
 * Fetch word definitions with caching
 * 
 * @param word - The word to fetch definitions for
 * @param options - Query options
 * @returns Query result with definitions, loading state, and error
 */
export function useWordDefinitions(
  word: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<WordDefinition[], Error>({
    queryKey: ['wordDefinitions', word.toLowerCase()],
    queryFn: () => dictionaryService.getWordDefinitions(word),
    
    // Dictionary definitions don't change, cache for 24 hours
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    
    // Only fetch if word is provided and enabled
    enabled: !!word && (options?.enabled !== false),
    
    // Retry on failure
    retry: 3,
  });
}

/**
 * Fetch word phonetic with caching
 * 
 * @param word - The word to fetch phonetic for
 * @param options - Query options
 * @returns Query result with phonetic, loading state, and error
 */
export function useWordPhonetic(
  word: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<string | undefined, Error>({
    queryKey: ['wordPhonetic', word.toLowerCase()],
    queryFn: () => dictionaryService.getPhonetic(word),
    
    // Phonetics don't change, cache for 24 hours
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    
    // Only fetch if word is provided and enabled
    enabled: !!word && (options?.enabled !== false),
    
    // Don't retry as much for phonetics (not critical)
    retry: 1,
  });
}

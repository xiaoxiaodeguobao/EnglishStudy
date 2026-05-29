/**
 * useDailyWords Hook
 * 
 * React Query hook for fetching and caching daily word lists.
 * Daily word lists are cached per date to avoid regenerating the same day's words.
 * 
 * Requirements: 10.4
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService, wordGeneratorService } from '../services';
import type { DailyWordList } from '../types';

/**
 * Fetch daily word list with caching
 * 
 * @param date - The date to fetch words for
 * @param options - Query options
 * @returns Query result with word list, loading state, error, and refetch function
 */
export function useDailyWords(
  date: Date,
  options?: {
    enabled?: boolean;
  }
) {
  const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const query = useQuery<DailyWordList | null, Error>({
    queryKey: ['dailyWords', dateKey],
    queryFn: () => storageService.loadDailyWordList(date),
    
    // Daily words don't change once generated, cache for 24 hours
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    
    // Only fetch if enabled
    enabled: options?.enabled !== false,
    
    // Don't retry loading from storage
    retry: false,
  });

  return {
    ...query,
    // Expose refetch for manual cache updates after generation
    refetch: query.refetch,
  };
}

/**
 * Invalidate daily words cache for a specific date
 * 
 * @param queryClient - React Query client instance
 * @param date - The date to invalidate cache for
 */
export function invalidateDailyWordsCache(queryClient: ReturnType<typeof useQueryClient>, date: Date) {
  const dateKey = date.toISOString().split('T')[0];
  queryClient.invalidateQueries({ queryKey: ['dailyWords', dateKey] });
}

/**
 * Refetch daily words for a specific date
 * 
 * @param queryClient - React Query client instance
 * @param date - The date to refetch words for
 */
export async function refetchDailyWords(queryClient: ReturnType<typeof useQueryClient>, date: Date) {
  const dateKey = date.toISOString().split('T')[0];
  await queryClient.refetchQueries({ queryKey: ['dailyWords', dateKey] });
}

/**
 * Update daily words cache with new data
 * 
 * @param queryClient - React Query client instance
 * @param wordList - The word list to update cache with
 */
export function updateDailyWordsCache(queryClient: ReturnType<typeof useQueryClient>, wordList: DailyWordList) {
  const dateKey = wordList.date.toISOString().split('T')[0];
  queryClient.setQueryData(['dailyWords', dateKey], wordList);
}

/**
 * Generate new daily words mutation
 * 
 * @returns Mutation for generating new daily words
 */
export function useGenerateDailyWords() {
  const queryClient = useQueryClient();
  
  return useMutation<
    DailyWordList,
    Error,
    { planId: string; date: Date; count: number }
  >({
    mutationFn: async ({ planId, date, count }) => {
      const wordList = await wordGeneratorService.generateDailyWords(planId, date, count);
      await storageService.saveDailyWordList(wordList);
      return wordList;
    },
    
    onSuccess: (data) => {
      const dateKey = data.date.toISOString().split('T')[0];
      
      // Update the cache with the new word list
      queryClient.setQueryData(['dailyWords', dateKey], data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['allWordLists'] });
    },
  });
}

/**
 * Fetch all word lists for a plan with caching
 * 
 * @param planId - The plan ID to fetch word lists for
 * @param options - Query options
 * @returns Query result with all word lists, loading state, and error
 */
export function useAllWordLists(
  planId: string,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery<DailyWordList[], Error>({
    queryKey: ['allWordLists', planId],
    queryFn: () => storageService.loadAllWordLists(planId),
    
    // Cache for 10 minutes since this can change as user learns
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    
    // Only fetch if planId is provided and enabled
    enabled: !!planId && (options?.enabled !== false),
    
    // Don't retry loading from storage
    retry: false,
  });
}

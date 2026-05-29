/**
 * React Query Client Configuration
 * 
 * Configures the QueryClient with caching strategies for API requests.
 * Requirements: 10.4
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure the QueryClient
 * 
 * Default cache times:
 * - staleTime: 5 minutes (data is considered fresh for 5 minutes)
 * - cacheTime: 30 minutes (unused data is kept in cache for 30 minutes)
 * 
 * For dictionary and AI services:
 * - Dictionary definitions don't change, so we cache them longer
 * - AI-generated content can be cached but with shorter times
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      
      // Unused data is kept in cache for 30 minutes
      gcTime: 1000 * 60 * 30,
      
      // Retry failed requests up to 2 times
      retry: 2,
      
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
  },
});

/**
 * useDailyWords Hook Tests
 * 
 * Tests for the daily words caching hook.
 * Requirements: 10.4
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useDailyWords, 
  useGenerateDailyWords, 
  useAllWordLists,
  invalidateDailyWordsCache,
  refetchDailyWords,
  updateDailyWordsCache
} from './useDailyWords';
import { storageService, wordGeneratorService } from '../services';
import type { DailyWordList } from '../types';

// Mock the services
vi.mock('../services', () => ({
  storageService: {
    loadDailyWordList: vi.fn(),
    saveDailyWordList: vi.fn(),
    loadAllWordLists: vi.fn(),
  },
  wordGeneratorService: {
    generateDailyWords: vi.fn(),
  },
}));

describe('useDailyWords', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch daily words successfully', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(mockWordList);

    const { result } = renderHook(() => useDailyWords(new Date('2024-01-01')), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWordList);
    expect(storageService.loadDailyWordList).toHaveBeenCalledTimes(1);
  });

  it('should cache daily words by date', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(mockWordList);

    const date = new Date('2024-01-01');

    // First render
    const { result: result1 } = renderHook(() => useDailyWords(date), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second render with same date - should use cache
    const { result: result2 } = renderHook(() => useDailyWords(date), { wrapper });

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // Should only call service once (cached)
    expect(storageService.loadDailyWordList).toHaveBeenCalledTimes(1);
  });

  it('should handle null word list', async () => {
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(null);

    const { result } = renderHook(() => useDailyWords(new Date('2024-01-01')), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(
      () => useDailyWords(new Date('2024-01-01'), { enabled: false }),
      { wrapper }
    );

    expect(result.current.isFetching).toBe(false);
    expect(storageService.loadDailyWordList).not.toHaveBeenCalled();
  });

  it('should expose refetch function for manual cache updates', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(mockWordList);

    const { result } = renderHook(() => useDailyWords(new Date('2024-01-01')), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify refetch function is available
    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('Cache Management Functions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should invalidate daily words cache for a specific date', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    // Set initial cache data
    queryClient.setQueryData(['dailyWords', '2024-01-01'], mockWordList);

    // Invalidate cache
    invalidateDailyWordsCache(queryClient, new Date('2024-01-01'));

    // Check that cache is marked as stale
    const queryState = queryClient.getQueryState(['dailyWords', '2024-01-01']);
    expect(queryState?.isInvalidated).toBe(true);
  });

  it('should update daily words cache with new data', () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    // Update cache
    updateDailyWordsCache(queryClient, mockWordList);

    // Verify cache was updated
    const cachedData = queryClient.getQueryData(['dailyWords', '2024-01-01']);
    expect(cachedData).toEqual(mockWordList);
  });

  it('should refetch daily words for a specific date', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(mockWordList);

    // First, we need to create an active query by fetching the data
    await queryClient.fetchQuery({
      queryKey: ['dailyWords', '2024-01-01'],
      queryFn: () => storageService.loadDailyWordList(new Date('2024-01-01')),
    });

    // Clear the mock to verify refetch calls it again
    vi.clearAllMocks();
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(mockWordList);

    // Refetch
    await refetchDailyWords(queryClient, new Date('2024-01-01'));

    // Verify the service was called again during refetch
    expect(storageService.loadDailyWordList).toHaveBeenCalled();

    // Verify cache was updated with refetched data
    const cachedData = queryClient.getQueryData(['dailyWords', '2024-01-01']);
    expect(cachedData).toEqual(mockWordList);
  });
});

describe('useGenerateDailyWords', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should generate and save daily words', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    vi.mocked(wordGeneratorService.generateDailyWords).mockResolvedValue(mockWordList);
    vi.mocked(storageService.saveDailyWordList).mockResolvedValue();

    const { result } = renderHook(() => useGenerateDailyWords(), { wrapper });

    result.current.mutate({
      planId: 'plan-1',
      date: new Date('2024-01-01'),
      count: 10,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(wordGeneratorService.generateDailyWords).toHaveBeenCalledWith(
      'plan-1',
      expect.any(Date),
      10
    );
    expect(storageService.saveDailyWordList).toHaveBeenCalledWith(mockWordList);
    expect(result.current.data).toEqual(mockWordList);
  });

  it('should update cache after generating words', async () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      date: new Date('2024-01-01'),
      planId: 'plan-1',
      words: [],
      associations: [],
      sentenceChains: [],
    };

    vi.mocked(wordGeneratorService.generateDailyWords).mockResolvedValue(mockWordList);
    vi.mocked(storageService.saveDailyWordList).mockResolvedValue();

    const { result } = renderHook(() => useGenerateDailyWords(), { wrapper });

    result.current.mutate({
      planId: 'plan-1',
      date: new Date('2024-01-01'),
      count: 10,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check if cache was updated
    const cachedData = queryClient.getQueryData(['dailyWords', '2024-01-01']);
    expect(cachedData).toEqual(mockWordList);
  });

  it('should handle generation errors', async () => {
    const mockError = new Error('Generation failed');
    vi.mocked(wordGeneratorService.generateDailyWords).mockRejectedValue(mockError);

    const { result } = renderHook(() => useGenerateDailyWords(), { wrapper });

    result.current.mutate({
      planId: 'plan-1',
      date: new Date('2024-01-01'),
      count: 10,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});

describe('useAllWordLists', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch all word lists for a plan', async () => {
    const mockWordLists: DailyWordList[] = [
      {
        id: 'list-1',
        date: new Date('2024-01-01'),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      },
      {
        id: 'list-2',
        date: new Date('2024-01-02'),
        planId: 'plan-1',
        words: [],
        associations: [],
        sentenceChains: [],
      },
    ];

    vi.mocked(storageService.loadAllWordLists).mockResolvedValue(mockWordLists);

    const { result } = renderHook(() => useAllWordLists('plan-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWordLists);
    expect(storageService.loadAllWordLists).toHaveBeenCalledWith('plan-1');
  });

  it('should cache word lists by plan ID', async () => {
    const mockWordLists: DailyWordList[] = [];
    vi.mocked(storageService.loadAllWordLists).mockResolvedValue(mockWordLists);

    // First render
    const { result: result1 } = renderHook(() => useAllWordLists('plan-1'), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second render - should use cache
    const { result: result2 } = renderHook(() => useAllWordLists('plan-1'), { wrapper });

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    expect(storageService.loadAllWordLists).toHaveBeenCalledTimes(1);
  });

  it('should not fetch when planId is empty', async () => {
    const { result } = renderHook(() => useAllWordLists(''), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(storageService.loadAllWordLists).not.toHaveBeenCalled();
  });
});

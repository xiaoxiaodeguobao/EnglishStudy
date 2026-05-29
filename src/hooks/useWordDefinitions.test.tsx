/**
 * useWordDefinitions Hook Tests
 * 
 * Tests for the word definitions caching hook.
 * Requirements: 10.4
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWordDefinitions, useWordPhonetic } from './useWordDefinitions';
import { dictionaryService } from '../services';
import type { WordDefinition } from '../types';

// Mock the dictionary service
vi.mock('../services', () => ({
  dictionaryService: {
    getWordDefinitions: vi.fn(),
    getPhonetic: vi.fn(),
  },
}));

describe('useWordDefinitions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
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

  it('should fetch word definitions successfully', async () => {
    const mockDefinitions: WordDefinition[] = [
      {
        partOfSpeech: 'noun',
        meaningEN: 'A test definition',
        meaningCN: '测试定义',
      },
    ];

    vi.mocked(dictionaryService.getWordDefinitions).mockResolvedValue(mockDefinitions);

    const { result } = renderHook(() => useWordDefinitions('test'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockDefinitions);
    expect(dictionaryService.getWordDefinitions).toHaveBeenCalledWith('test');
    expect(dictionaryService.getWordDefinitions).toHaveBeenCalledTimes(1);
  });

  it('should cache word definitions and not refetch', async () => {
    const mockDefinitions: WordDefinition[] = [
      {
        partOfSpeech: 'verb',
        meaningEN: 'To test something',
        meaningCN: '测试某物',
      },
    ];

    vi.mocked(dictionaryService.getWordDefinitions).mockResolvedValue(mockDefinitions);

    // First render
    const { result: result1 } = renderHook(() => useWordDefinitions('example'), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    expect(dictionaryService.getWordDefinitions).toHaveBeenCalledTimes(1);

    // Second render with same word - should use cache
    const { result: result2 } = renderHook(() => useWordDefinitions('example'), { wrapper });

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // Should still be called only once (cached)
    expect(dictionaryService.getWordDefinitions).toHaveBeenCalledTimes(1);
    expect(result2.current.data).toEqual(mockDefinitions);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    vi.mocked(dictionaryService.getWordDefinitions).mockRejectedValue(mockError);

    const { result } = renderHook(() => useWordDefinitions('error'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useWordDefinitions('test', { enabled: false }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(dictionaryService.getWordDefinitions).not.toHaveBeenCalled();
  });

  it('should normalize word to lowercase for cache key', async () => {
    const mockDefinitions: WordDefinition[] = [
      {
        partOfSpeech: 'noun',
        meaningEN: 'A test',
        meaningCN: '测试',
      },
    ];

    vi.mocked(dictionaryService.getWordDefinitions).mockResolvedValue(mockDefinitions);

    // Fetch with uppercase
    const { result: result1 } = renderHook(() => useWordDefinitions('TEST'), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Fetch with lowercase - should use same cache
    const { result: result2 } = renderHook(() => useWordDefinitions('test'), { wrapper });

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // Should only call service once due to cache
    expect(dictionaryService.getWordDefinitions).toHaveBeenCalledTimes(1);
  });
});

describe('useWordPhonetic', () => {
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

  it('should fetch word phonetic successfully', async () => {
    const mockPhonetic = '/test/';
    vi.mocked(dictionaryService.getPhonetic).mockResolvedValue(mockPhonetic);

    const { result } = renderHook(() => useWordPhonetic('test'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(mockPhonetic);
    expect(dictionaryService.getPhonetic).toHaveBeenCalledWith('test');
  });

  it('should cache phonetic data', async () => {
    const mockPhonetic = '/example/';
    vi.mocked(dictionaryService.getPhonetic).mockResolvedValue(mockPhonetic);

    // First render
    const { result: result1 } = renderHook(() => useWordPhonetic('example'), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second render - should use cache
    const { result: result2 } = renderHook(() => useWordPhonetic('example'), { wrapper });

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    expect(dictionaryService.getPhonetic).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined phonetic', async () => {
    vi.mocked(dictionaryService.getPhonetic).mockResolvedValue(undefined);

    const { result } = renderHook(() => useWordPhonetic('test'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeUndefined();
  });
});

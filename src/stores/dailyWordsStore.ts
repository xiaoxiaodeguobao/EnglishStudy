/**
 * Daily Words Store
 * 
 * Zustand store for managing daily word lists.
 * Requirements: 3.1, 3.2
 */

import { create } from 'zustand';
import type { QueryClient } from '@tanstack/react-query';
import type { DailyWordList } from '../types';
import { storageService, wordGeneratorService } from '../services';

interface DailyWordsState {
  currentWordList: DailyWordList | null;
  loading: boolean;
  isGenerating: boolean; // Distinguishes between loading existing words and generating new words
  error: string | null;
  queryClient: QueryClient | null; // React Query client for cache management

  // Actions
  setQueryClient: (client: QueryClient) => void;
  loadDailyWords: (date: Date) => Promise<void>;
  generateNewWords: (planId: string, date: Date, count: number) => Promise<void>;
  clearError: () => void;
  resetState: () => void; // Resets state for error recovery
}

export const useDailyWordsStore = create<DailyWordsState>((set, get) => ({
  currentWordList: null,
  loading: false,
  isGenerating: false,
  error: null,
  queryClient: null,

  setQueryClient: (client: QueryClient) => set({ queryClient: client }),

  loadDailyWords: async (date: Date) => {
    // Set loading flag (not generating) and clear any previous errors
    set({ loading: true, isGenerating: false, error: null });
    try {
      const wordList = await storageService.loadDailyWordList(date);
      // Successfully loaded - update state and clear loading flag
      set({ currentWordList: wordList, loading: false, isGenerating: false });
    } catch (error) {
      // Error during load - reset state properly for retry
      set({
        error: error instanceof Error ? error.message : '加载每日单词失败',
        loading: false,
        isGenerating: false,
        // Keep currentWordList as-is to allow retry without losing existing data
      });
    }
  },

  generateNewWords: async (planId: string, date: Date, count: number) => {
    // Set both loading and isGenerating flags, clear any previous errors
    set({ loading: true, isGenerating: true, error: null });
    try {
      const wordList = await wordGeneratorService.generateDailyWords(planId, date, count);
      await storageService.saveDailyWordList(wordList);
      
      // Successfully generated and persisted - update state and clear flags
      set({ currentWordList: wordList, loading: false, isGenerating: false });
      
      // Update React Query cache if queryClient is available
      const { queryClient } = get();
      if (queryClient) {
        const dateKey = wordList.date.toISOString().split('T')[0];
        
        // Update the cache with the new word list
        queryClient.setQueryData(['dailyWords', dateKey], wordList);
        
        // Invalidate to trigger refetch for any active queries
        await queryClient.invalidateQueries({ queryKey: ['dailyWords', dateKey] });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['allWordLists'] });
      }
    } catch (error) {
      // Error during generation - reset state properly for retry
      set({
        error: error instanceof Error ? error.message : '生成每日单词失败',
        loading: false,
        isGenerating: false,
        // Clear currentWordList on generation error to allow clean retry
        currentWordList: null,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  resetState: () => set({ 
    currentWordList: null, 
    loading: false, 
    isGenerating: false, 
    error: null 
  }),
}));

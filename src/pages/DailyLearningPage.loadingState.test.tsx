/**
 * Loading State Management Tests for DailyLearningPage
 * 
 * Tests that verify loading state properly reflects both load and auto-generation operations,
 * prevents race conditions, and provides appropriate UI feedback.
 * 
 * Requirements: 2.1, 2.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DailyLearningPage } from './DailyLearningPage';
import { useDailyWordsStore, useLearningPlanStore, useProgressStore } from '../stores';
import type { LearningPlan, Progress, DailyWordList } from '../types';

// Mock the stores
vi.mock('../stores', () => ({
  useDailyWordsStore: vi.fn(),
  useLearningPlanStore: vi.fn(),
  useProgressStore: vi.fn(),
}));

// Mock the components
vi.mock('../components/WordList', () => ({
  WordList: ({ loading }: { loading: boolean }) => (
    <div data-testid="word-list">Word List (loading: {loading.toString()})</div>
  ),
}));

vi.mock('../components/SentenceChainSection', () => ({
  SentenceChainSection: () => <div data-testid="sentence-chain">Sentence Chain</div>,
}));

vi.mock('../components/WordAssociationDisplay', () => ({
  WordAssociationDisplay: () => <div data-testid="word-association">Word Association</div>,
}));

vi.mock('../components/ErrorMessage', () => ({
  ErrorMessage: ({ message }: { message: string }) => (
    <div data-testid="error-message">{message}</div>
  ),
}));

describe('DailyLearningPage - Loading State Management', () => {
  let queryClient: QueryClient;
  const mockPlan: LearningPlan = {
    id: 'plan-1',
    wordsPerDay: 10,
    difficulty: 'intermediate',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProgress: Progress = {
    planId: 'plan-1',
    dailyRecords: [],
    totalWordsLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Default mock implementations
    vi.mocked(useLearningPlanStore).mockReturnValue({
      currentPlan: mockPlan,
      loading: false,
      error: null,
      loadCurrentPlan: vi.fn(),
      createPlan: vi.fn(),
      updatePlan: vi.fn(),
    });

    vi.mocked(useProgressStore).mockReturnValue({
      progress: mockProgress,
      loading: false,
      error: null,
      loadProgress: vi.fn(),
      markComplete: vi.fn(),
      getStreakInfo: vi.fn(),
    });
  });

  it('should show loading indicator during initial load', () => {
    // Mock store state: loading existing words
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: true,
      isGenerating: false,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Should show loading indicator with "loading" message
    expect(screen.getByText('正在加载...')).toBeInTheDocument();
    expect(screen.getByText('正在从存储中加载单词列表')).toBeInTheDocument();
    
    // Should NOT show generate button
    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();
  });

  it('should show generating indicator during auto-generation', () => {
    // Mock store state: generating new words
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: true,
      isGenerating: true,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Should show loading indicator with "generating" message
    expect(screen.getByText('正在生成今日单词...')).toBeInTheDocument();
    expect(screen.getByText(/正在为您生成 10 个单词，请稍候/)).toBeInTheDocument();
    
    // Should NOT show generate button
    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();
  });

  it('should show generating indicator when only isGenerating is true', () => {
    // Mock store state: generating but loading is false (edge case)
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: true,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Should show loading indicator even if loading is false but isGenerating is true
    expect(screen.getByText('正在生成今日单词...')).toBeInTheDocument();
    
    // Should NOT show generate button
    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();
  });

  it('should NOT show generate button during loading or generating', () => {
    // Test with loading=true
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: true,
      isGenerating: false,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();

    // Test with isGenerating=true
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: true,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();
  });

  it('should prevent UI flicker by not showing generate button during state transitions', async () => {
    const generateNewWords = vi.fn().mockImplementation(async () => {
      // Simulate async generation
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Start with no words, not loading
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords,
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Initially should show generate button (before auto-generation triggers)
    expect(screen.getByText('生成今日单词')).toBeInTheDocument();

    // Simulate auto-generation starting (loading and isGenerating become true)
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: true,
      isGenerating: true,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords,
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Should show loading indicator, NOT generate button
    expect(screen.getByText('正在生成今日单词...')).toBeInTheDocument();
    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();
  });

  it('should not pass loading prop to WordList when words are displayed', () => {
    const mockWordList: DailyWordList = {
      id: 'list-1',
      planId: 'plan-1',
      date: new Date('2024-01-15'),
      words: [
        {
          word: 'test',
          definition: 'a test word',
          partOfSpeech: 'noun',
          difficulty: 'intermediate',
          examples: [],
        },
      ],
      associations: [],
      sentenceChains: [],
      createdAt: new Date('2024-01-15'),
    };

    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: mockWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // WordList should receive loading=false
    const wordList = screen.getByTestId('word-list');
    expect(wordList).toHaveTextContent('loading: false');
  });

  it('should show error message and hide loading indicators when error occurs', () => {
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: '生成单词失败',
      loadDailyWords: vi.fn(),
      generateNewWords: vi.fn(),
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Should show error message
    expect(screen.getByTestId('error-message')).toHaveTextContent('生成单词失败');
    
    // Should NOT show loading indicator or generate button
    expect(screen.queryByText('正在加载...')).not.toBeInTheDocument();
    expect(screen.queryByText('正在生成今日单词...')).not.toBeInTheDocument();
    expect(screen.queryByText('生成今日单词')).not.toBeInTheDocument();
  });

  it('should properly handle race condition prevention with isGenerating flag', async () => {
    const generateNewWords = vi.fn();

    // Initial state: ready for auto-generation
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords,
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Wait for auto-generation to trigger
    await waitFor(() => {
      expect(generateNewWords).toHaveBeenCalledTimes(1);
    });

    // Simulate rapid re-render with isGenerating=true (should prevent duplicate call)
    vi.mocked(useDailyWordsStore).mockReturnValue({
      currentWordList: null,
      loading: true,
      isGenerating: true,
      error: null,
      loadDailyWords: vi.fn(),
      generateNewWords,
      clearError: vi.fn(),
      setQueryClient: vi.fn(),
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <DailyLearningPage />
      </QueryClientProvider>
    );

    // Should still only have been called once (no duplicate call)
    expect(generateNewWords).toHaveBeenCalledTimes(1);
  });
});

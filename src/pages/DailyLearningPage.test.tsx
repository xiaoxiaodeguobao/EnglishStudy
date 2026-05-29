/**
 * DailyLearningPage Component Tests
 * 
 * Tests for the daily learning page component.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DailyLearningPage from './DailyLearningPage';
import { useDailyWordsStore, useLearningPlanStore, useProgressStore } from '../stores';
import type { DailyWordList, LearningPlan, LearningProgress } from '../types';

// Helper to render with QueryClientProvider
function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// Mock the stores
vi.mock('../stores', () => ({
  useDailyWordsStore: vi.fn(),
  useLearningPlanStore: vi.fn(),
  useProgressStore: vi.fn(),
}));

describe('DailyLearningPage', () => {
  const mockLoadDailyWords = vi.fn();
  const mockGenerateNewWords = vi.fn();
  const mockClearError = vi.fn();
  const mockLoadCurrentPlan = vi.fn();
  const mockMarkComplete = vi.fn();
  const mockLoadProgress = vi.fn();

  const mockPlan: LearningPlan = {
    id: 'plan-1',
    daysCount: 30,
    wordsPerDay: 10,
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockWordList: DailyWordList = {
    id: 'wordlist-1',
    date: new Date(),
    planId: 'plan-1',
    words: [
      {
        id: 'word-1',
        word: 'example',
        phonetic: '/ɪɡˈzæmpəl/',
        definitions: [
          {
            partOfSpeech: 'noun',
            meaningCN: '例子',
            meaningEN: 'a thing characteristic of its kind',
          },
        ],
        examples: [
          {
            sentence: 'This is an example sentence.',
            translation: '这是一个例句。',
            highlightWord: 'example',
          },
        ],
        associations: [],
        generatedAt: new Date(),
      },
    ],
    associations: [
      {
        word1Id: 'word-1',
        word2Id: 'word-2',
        associationType: 'theme',
        description: 'Both related to learning',
      },
    ],
    sentenceChains: [
      {
        id: 'chain-1',
        sentence: 'This is an example sentence.',
        usedWordIds: ['word-1'],
        translation: '这是一个例句。',
      },
    ],
  };

  const mockProgress: LearningProgress = {
    planId: 'plan-1',
    completedDays: 5,
    totalWords: 50,
    completionPercentage: 16.67,
    remainingDays: 25,
    dailyRecords: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
    });

    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: null,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    (useProgressStore as any).mockReturnValue({
      progress: null,
      loading: false,
      error: null,
      markComplete: mockMarkComplete,
      loadProgress: mockLoadProgress,
    });
  });

  describe('Requirement 3.1: Display current date', () => {
    it('should display the current date', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      renderWithQueryClient(<DailyLearningPage />);

      // Check for "今日学习" header
      expect(screen.getByText('今日学习')).toBeInTheDocument();

      // Check for date display (should contain year, month, day)
      const dateElement = screen.getByText(/\d{4}年/);
      expect(dateElement).toBeInTheDocument();
    });
  });

  describe('Requirement 3.2: Display word list', () => {
    it('should display word list when available', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      renderWithQueryClient(<DailyLearningPage />);

      // Check for word list section
      expect(screen.getByText('今日单词')).toBeInTheDocument();
      expect(screen.getAllByText('example').length).toBeGreaterThan(0);
    });

    it('should show generate button when no word list exists', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      renderWithQueryClient(<DailyLearningPage />);

      expect(screen.getByText('生成今日单词')).toBeInTheDocument();
    });
  });

  describe('Requirement 3.3: Display word associations', () => {
    it('should display word associations when available', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      renderWithQueryClient(<DailyLearningPage />);

      // Check for associations section
      expect(screen.getByText('单词关联')).toBeInTheDocument();
    });
  });

  describe('Requirement 3.4: Display sentence chains', () => {
    it('should display sentence chains when available', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      renderWithQueryClient(<DailyLearningPage />);

      // Check for sentence chains section
      expect(screen.getByText('连锁造句')).toBeInTheDocument();
    });
  });

  describe('Requirement 8.5: Mark day complete', () => {
    it('should show complete button when word list is available', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      (useProgressStore as any).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        markComplete: mockMarkComplete,
        loadProgress: mockLoadProgress,
      });

      renderWithQueryClient(<DailyLearningPage />);

      expect(screen.getAllByText('完成学习')[0]).toBeInTheDocument();
    });

    it('should call markComplete when complete button is clicked', async () => {
      const user = userEvent.setup();

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      (useProgressStore as any).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        markComplete: mockMarkComplete,
        loadProgress: mockLoadProgress,
      });

      renderWithQueryClient(<DailyLearningPage />);

      const completeButton = screen.getAllByText('完成学习')[0];
      await user.click(completeButton);

      await waitFor(() => {
        expect(mockMarkComplete).toHaveBeenCalledWith('plan-1', expect.any(Date));
      });
    });

    it('should show completed state when day is already completed', () => {
      const completedProgress: LearningProgress = {
        ...mockProgress,
        dailyRecords: [
          {
            date: new Date(),
            wordListId: 'wordlist-1',
            completed: true,
            completedAt: new Date(),
          },
        ],
      };

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      (useProgressStore as any).mockReturnValue({
        progress: completedProgress,
        loading: false,
        error: null,
        markComplete: mockMarkComplete,
        loadProgress: mockLoadProgress,
      });

      renderWithQueryClient(<DailyLearningPage />);

      expect(screen.getByText('今日已完成')).toBeInTheDocument();
    });
  });

  describe('Generate new words functionality', () => {
    it('should call generateNewWords when generate button is clicked', async () => {
      const user = userEvent.setup();

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      renderWithQueryClient(<DailyLearningPage />);

      const generateButton = screen.getByText('生成今日单词');
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateNewWords).toHaveBeenCalledWith(
          'plan-1',
          expect.any(Date),
          10
        );
      });
    });
  });

  describe('No plan state', () => {
    it('should show message when no plan exists', () => {
      renderWithQueryClient(<DailyLearningPage />);

      expect(screen.getByText('还没有学习计划')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should display error message when error occurs', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: null,
        loading: false,
        error: '生成单词失败',
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
      });

      renderWithQueryClient(<DailyLearningPage />);

      expect(screen.getByText('生成单词失败')).toBeInTheDocument();
    });
  });
});

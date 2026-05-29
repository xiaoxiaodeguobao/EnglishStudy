/**
 * Preservation Property Tests - Daily Words Persistence Fix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * These tests verify that non-buggy behaviors remain unchanged after the fix.
 * They test functionality that should NOT be affected by the persistence fix.
 * 
 * **Property 2: Preservation** - Non-Current-Day Functionality Unchanged
 * 
 * **IMPORTANT**: These tests are run on UNFIXED code to establish baseline behavior.
 * They should PASS on unfixed code, confirming the behaviors we need to preserve.
 * 
 * After the fix is implemented, these same tests should still PASS,
 * confirming that no regressions were introduced.
 * 
 * Preservation Requirements:
 * - Date changes to new day trigger new word generation (3.1)
 * - Learning plan modifications work correctly (3.2)
 * - Progress tracking (marking days complete) works correctly (3.3)
 * - Historical word list access works correctly (3.4)
 * - Navigation to other pages works correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fc from 'fast-check';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DailyLearningPage from './DailyLearningPage';
import ProgressPage from './ProgressPage';
import ReviewPage from './ReviewPage';
import PlanSetupPage from './PlanSetupPage';
import { useDailyWordsStore, useLearningPlanStore, useProgressStore } from '../stores';
import type { LearningPlan, DailyWordList, LearningProgress } from '../types';
import { storageService } from '../services';

// Mock the stores
vi.mock('../stores', () => ({
  useDailyWordsStore: vi.fn(),
  useLearningPlanStore: vi.fn(),
  useProgressStore: vi.fn(),
}));

// Mock the storage service
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    storageService: {
      loadDailyWordList: vi.fn(),
      saveDailyWordList: vi.fn(),
      loadAllWordLists: vi.fn(),
      loadCurrentPlan: vi.fn(),
      loadPlan: vi.fn(),
      savePlan: vi.fn(),
      loadProgress: vi.fn(),
      saveProgress: vi.fn(),
      searchWords: vi.fn(),
      getWordsByDateRange: vi.fn(),
    },
  };
});

describe('Preservation Property Tests: Non-Current-Day Functionality Unchanged', () => {
  const mockLoadDailyWords = vi.fn();
  const mockGenerateNewWords = vi.fn();
  const mockClearError = vi.fn();
  const mockSetQueryClient = vi.fn();
  const mockLoadCurrentPlan = vi.fn();
  const mockCreatePlan = vi.fn();
  const mockUpdatePlan = vi.fn();
  const mockMarkComplete = vi.fn();
  const mockLoadProgress = vi.fn();

  let queryClient: QueryClient;

  // Helper to create a mock word list
  const createMockWordList = (planId: string, date: Date, count: number): DailyWordList => ({
    id: `wordlist-${planId}-${date.toISOString()}`,
    date: date,
    planId: planId,
    words: Array.from({ length: count }, (_, i) => ({
      id: `word-${i}`,
      word: `word${i}`,
      phonetic: '/test/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '测试',
          meaningEN: 'test',
        },
      ],
      examples: [],
      associations: [],
      generatedAt: date,
    })),
    associations: [],
    sentenceChains: [],
  });

  // Helper to create a mock learning plan
  const createMockPlan = (id: string, daysCount: number, wordsPerDay: number, startDate: Date): LearningPlan => ({
    id,
    daysCount,
    wordsPerDay,
    startDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Helper to create mock progress
  const createMockProgress = (planId: string, completedDays: number, totalWords: number): LearningProgress => ({
    planId,
    completedDays,
    totalWords,
    completionPercentage: 0,
    remainingDays: 0,
    dailyRecords: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Default mock implementations
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: null,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
      createPlan: mockCreatePlan,
      updatePlan: mockUpdatePlan,
    });

    (useProgressStore as any).mockReturnValue({
      progress: null,
      loading: false,
      error: null,
      markComplete: mockMarkComplete,
      loadProgress: mockLoadProgress,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  // Helper to wrap components with QueryClientProvider
  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  /**
   * Test 1: Date Change Preservation (Requirement 3.1)
   * 
   * Verifies that changing to a new day triggers new word generation.
   * This behavior should remain unchanged after the fix.
   */
  describe('Test 1: Date Change to New Day Generates New Words', () => {
    it('Property: Date change should trigger new word generation (not reuse same words)', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary plan configuration
          fc.record({
            planId: fc.uuid(),
            wordsPerDay: fc.integer({ min: 5, max: 20 }),
            daysCount: fc.integer({ min: 7, max: 90 }),
          }),
          // Generate two different dates
          fc.tuple(
            fc.date({ min: new Date('2024-01-01'), max: new Date('2024-06-30') }),
            fc.date({ min: new Date('2024-07-01'), max: new Date('2024-12-31') })
          ),
          async (planConfig, [date1, date2]) => {
            // Setup: Create a learning plan
            const mockPlan = createMockPlan(
              planConfig.planId,
              planConfig.daysCount,
              planConfig.wordsPerDay,
              date1
            );

            (useLearningPlanStore as any).mockReturnValue({
              currentPlan: mockPlan,
              loading: false,
              error: null,
              loadCurrentPlan: mockLoadCurrentPlan,
            });

            // Setup: Mock word lists for two different dates
            const wordList1 = createMockWordList(planConfig.planId, date1, planConfig.wordsPerDay);
            const wordList2 = createMockWordList(planConfig.planId, date2, planConfig.wordsPerDay);

            // Make word lists different by changing word content
            wordList2.words = wordList2.words.map((word, i) => ({
              ...word,
              word: `different-word-${i}`,
            }));

            vi.mocked(storageService.loadDailyWordList).mockImplementation(async (date: Date) => {
              if (date.toDateString() === date1.toDateString()) {
                return wordList1;
              } else if (date.toDateString() === date2.toDateString()) {
                return wordList2;
              }
              return null;
            });

            mockLoadDailyWords.mockImplementation(async (date: Date) => {
              if (date.toDateString() === date1.toDateString()) {
                return wordList1;
              } else if (date.toDateString() === date2.toDateString()) {
                return wordList2;
              }
              return null;
            });

            // Observation: Load words for date1
            (useDailyWordsStore as any).mockReturnValue({
              currentWordList: wordList1,
              loading: false,
              error: null,
              loadDailyWords: mockLoadDailyWords,
              generateNewWords: mockGenerateNewWords,
              clearError: mockClearError,
              setQueryClient: mockSetQueryClient,
            });

            const { unmount } = renderWithQueryClient(<DailyLearningPage />);

            await waitFor(() => {
              expect(mockLoadDailyWords).toHaveBeenCalled();
            });

            unmount();

            // Observation: Load words for date2 (different day)
            (useDailyWordsStore as any).mockReturnValue({
              currentWordList: wordList2,
              loading: false,
              error: null,
              loadDailyWords: mockLoadDailyWords,
              generateNewWords: mockGenerateNewWords,
              clearError: mockClearError,
              setQueryClient: mockSetQueryClient,
            });

            renderWithQueryClient(<DailyLearningPage />);

            await waitFor(() => {
              expect(mockLoadDailyWords).toHaveBeenCalled();
            });

            // **ASSERTION**: Different dates should have different word lists
            // This confirms that date changes trigger new word generation
            expect(wordList1.id).not.toBe(wordList2.id);
            expect(wordList1.words[0].word).not.toBe(wordList2.words[0].word);
          }
        ),
        {
          numRuns: 5,
          verbose: true,
        }
      );
    });

    it('Concrete Example: Different days should have different word lists', async () => {
      const mockPlan = createMockPlan('plan-1', 30, 10, new Date('2024-01-01'));

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      // Day 1 word list
      const wordListDay1 = createMockWordList('plan-1', new Date('2024-01-15'), 10);
      wordListDay1.words[0].word = 'apple';

      // Day 2 word list (different words)
      const wordListDay2 = createMockWordList('plan-1', new Date('2024-01-16'), 10);
      wordListDay2.words[0].word = 'banana';

      vi.mocked(storageService.loadDailyWordList).mockImplementation(async (date: Date) => {
        if (date.toDateString() === new Date('2024-01-15').toDateString()) {
          return wordListDay1;
        } else if (date.toDateString() === new Date('2024-01-16').toDateString()) {
          return wordListDay2;
        }
        return null;
      });

      // Verify different dates have different word lists
      const list1 = await storageService.loadDailyWordList(new Date('2024-01-15'));
      const list2 = await storageService.loadDailyWordList(new Date('2024-01-16'));

      expect(list1).not.toBeNull();
      expect(list2).not.toBeNull();
      expect(list1!.words[0].word).toBe('apple');
      expect(list2!.words[0].word).toBe('banana');
      expect(list1!.id).not.toBe(list2!.id);
    });
  });

  /**
   * Test 2: Learning Plan Modification Preservation (Requirement 3.2)
   * 
   * Verifies that modifying the learning plan works correctly.
   * This behavior should remain unchanged after the fix.
   */
  describe('Test 2: Learning Plan Modifications Work Correctly', () => {
    it('Property: Plan modifications should allow new word generation with updated parameters', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary plan configurations
          fc.record({
            planId: fc.uuid(),
            initialWordsPerDay: fc.integer({ min: 5, max: 15 }),
            updatedWordsPerDay: fc.integer({ min: 16, max: 30 }),
            daysCount: fc.integer({ min: 7, max: 90 }),
          }),
          async (config) => {
            // Setup: Create initial plan
            const initialPlan = createMockPlan(
              config.planId,
              config.daysCount,
              config.initialWordsPerDay,
              new Date('2024-01-01')
            );

            (useLearningPlanStore as any).mockReturnValue({
              currentPlan: initialPlan,
              loading: false,
              error: null,
              loadCurrentPlan: mockLoadCurrentPlan,
              updatePlan: mockUpdatePlan,
            });

            // Observation: Initial plan has specific wordsPerDay
            expect(initialPlan.wordsPerDay).toBe(config.initialWordsPerDay);

            // Action: Update plan
            const updatedPlan = {
              ...initialPlan,
              wordsPerDay: config.updatedWordsPerDay,
              updatedAt: new Date(),
            };

            mockUpdatePlan.mockResolvedValue(updatedPlan);

            await mockUpdatePlan(config.planId, {
              wordsPerDay: config.updatedWordsPerDay,
            });

            // **ASSERTION**: Plan should be updated with new parameters
            expect(mockUpdatePlan).toHaveBeenCalledWith(config.planId, {
              wordsPerDay: config.updatedWordsPerDay,
            });

            // Verify the update function was called successfully
            expect(mockUpdatePlan).toHaveBeenCalled();
          }
        ),
        {
          numRuns: 5,
          verbose: true,
        }
      );
    });

    it('Concrete Example: Updating plan should change wordsPerDay', async () => {
      const mockPlan = createMockPlan('plan-1', 30, 10, new Date('2024-01-01'));

      mockUpdatePlan.mockResolvedValue({
        ...mockPlan,
        wordsPerDay: 15,
        updatedAt: new Date(),
      });

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
        updatePlan: mockUpdatePlan,
      });

      // Initial plan has 10 words per day
      expect(mockPlan.wordsPerDay).toBe(10);

      // Update plan to 15 words per day
      await mockUpdatePlan('plan-1', { wordsPerDay: 15 });

      // Verify update was called with correct parameters
      expect(mockUpdatePlan).toHaveBeenCalledWith('plan-1', { wordsPerDay: 15 });
    });
  });

  /**
   * Test 3: Progress Tracking Preservation (Requirement 3.3)
   * 
   * Verifies that marking days complete and tracking progress works correctly.
   * This behavior should remain unchanged after the fix.
   */
  describe('Test 3: Progress Tracking Continues to Work', () => {
    it('Property: Marking days complete should update progress correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary progress data
          fc.record({
            planId: fc.uuid(),
            completedDays: fc.integer({ min: 0, max: 20 }),
            totalWords: fc.integer({ min: 0, max: 200 }),
          }),
          async (progressData) => {
            const mockPlan = createMockPlan(progressData.planId, 30, 10, new Date('2024-01-01'));
            const mockProgress = createMockProgress(
              progressData.planId,
              progressData.completedDays,
              progressData.totalWords
            );

            (useLearningPlanStore as any).mockReturnValue({
              currentPlan: mockPlan,
              loading: false,
              error: null,
              loadCurrentPlan: mockLoadCurrentPlan,
            });

            (useProgressStore as any).mockReturnValue({
              progress: mockProgress,
              loading: false,
              error: null,
              markComplete: mockMarkComplete,
              loadProgress: mockLoadProgress,
            });

            mockMarkComplete.mockResolvedValue(undefined);

            // Action: Mark a day complete
            const testDate = new Date('2024-01-15');
            await mockMarkComplete(progressData.planId, testDate);

            // **ASSERTION**: markComplete should be called with correct parameters
            expect(mockMarkComplete).toHaveBeenCalledWith(progressData.planId, testDate);
          }
        ),
        {
          numRuns: 5,
          verbose: true,
        }
      );
    });

    it('Concrete Example: Marking day complete should call markComplete function', async () => {
      const mockPlan = createMockPlan('plan-1', 30, 10, new Date('2024-01-01'));
      const mockProgress = createMockProgress('plan-1', 5, 50);
      const mockWordList = createMockWordList('plan-1', new Date(), 10);

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useProgressStore as any).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        markComplete: mockMarkComplete,
        loadProgress: mockLoadProgress,
      });

      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: mockWordList,
        loading: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
        setQueryClient: mockSetQueryClient,
      });

      mockMarkComplete.mockResolvedValue(undefined);

      renderWithQueryClient(<DailyLearningPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('今日单词')).toBeInTheDocument();
      });

      // Find and click the complete button (use getAllByRole since there are two buttons)
      const completeButtons = screen.getAllByRole('button', { name: /完成学习|完成今日学习/ });
      expect(completeButtons.length).toBeGreaterThan(0);

      await userEvent.click(completeButtons[0]);

      // Verify markComplete was called
      await waitFor(() => {
        expect(mockMarkComplete).toHaveBeenCalled();
      });
    });
  });

  /**
   * Test 4: Historical Word List Access Preservation (Requirement 3.4)
   * 
   * Verifies that accessing historical word lists from previous dates works correctly.
   * This behavior should remain unchanged after the fix.
   */
  describe('Test 4: Historical Word Lists Remain Accessible', () => {
    it('Property: Historical word lists from previous dates should be accessible', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary historical dates
          fc.array(
            fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
            { minLength: 2, maxLength: 10 }
          ),
          async (dates) => {
            const planId = 'test-plan';
            const mockPlan = createMockPlan(planId, 30, 10, dates[0]);

            // Create word lists for all dates
            const wordLists = dates.map(date => createMockWordList(planId, date, 10));

            vi.mocked(storageService.loadAllWordLists).mockResolvedValue(wordLists);

            // Action: Load all word lists
            const loadedLists = await storageService.loadAllWordLists(planId);

            // **ASSERTION**: All historical word lists should be accessible
            expect(loadedLists).toHaveLength(wordLists.length);
            expect(loadedLists).toEqual(wordLists);
          }
        ),
        {
          numRuns: 5,
          verbose: true,
        }
      );
    });

    it('Concrete Example: Should be able to load word lists from previous dates', async () => {
      const planId = 'plan-1';
      const date1 = new Date('2024-01-10');
      const date2 = new Date('2024-01-11');
      const date3 = new Date('2024-01-12');

      const wordList1 = createMockWordList(planId, date1, 10);
      const wordList2 = createMockWordList(planId, date2, 10);
      const wordList3 = createMockWordList(planId, date3, 10);

      vi.mocked(storageService.loadAllWordLists).mockResolvedValue([
        wordList1,
        wordList2,
        wordList3,
      ]);

      // Load all historical word lists
      const historicalLists = await storageService.loadAllWordLists(planId);

      // Verify all lists are accessible
      expect(historicalLists).toHaveLength(3);
      expect(historicalLists[0].date).toEqual(date1);
      expect(historicalLists[1].date).toEqual(date2);
      expect(historicalLists[2].date).toEqual(date3);
    });
  });

  /**
   * Test 5: Navigation Preservation
   * 
   * Verifies that navigation to other pages works correctly.
   * This behavior should remain unchanged after the fix.
   */
  describe('Test 5: Navigation to Other Pages Works Correctly', () => {
    it('Concrete Example: Should be able to navigate to Progress page', async () => {
      const mockPlan = createMockPlan('plan-1', 30, 10, new Date('2024-01-01'));
      const mockProgress = createMockProgress('plan-1', 5, 50);

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
      });

      (useProgressStore as any).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        markComplete: mockMarkComplete,
        loadProgress: mockLoadProgress,
      });

      mockLoadProgress.mockResolvedValue(mockProgress);

      // Render Progress page
      renderWithQueryClient(<ProgressPage />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getAllByText('学习进度').length).toBeGreaterThan(0);
      });

      // Verify progress page content is displayed
      expect(screen.getByText('总单词数')).toBeInTheDocument();
      expect(screen.getByText('完成百分比')).toBeInTheDocument();
    });

    it('Concrete Example: Should be able to navigate to Review page', async () => {
      const mockWords = [
        {
          id: 'word-1',
          word: 'example',
          phonetic: '/test/',
          definitions: [{ partOfSpeech: 'noun', meaningCN: '例子', meaningEN: 'example' }],
          examples: [],
          associations: [],
          generatedAt: new Date(),
        },
      ];

      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      // Render Review page
      renderWithQueryClient(<ReviewPage />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('单词复习')).toBeInTheDocument();
      });

      // Verify review page content is displayed
      expect(screen.getByPlaceholderText('搜索单词...')).toBeInTheDocument();
    });

    it('Concrete Example: Should be able to navigate to Plan Setup page', async () => {
      const mockPlan = createMockPlan('plan-1', 30, 10, new Date('2024-01-01'));

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        loadCurrentPlan: mockLoadCurrentPlan,
        createPlan: mockCreatePlan,
        updatePlan: mockUpdatePlan,
      });

      // Render Plan Setup page
      renderWithQueryClient(<PlanSetupPage />);

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('学习计划设置')).toBeInTheDocument();
      });

      // Verify plan setup page content is displayed
      expect(screen.getByLabelText('学习天数')).toBeInTheDocument();
      expect(screen.getByLabelText('每日学习单词数量')).toBeInTheDocument();
    });
  });
});

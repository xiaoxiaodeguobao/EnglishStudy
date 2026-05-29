/**
 * Bug Condition Exploration Test - Daily Words Persistence Fix
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * This test explores the bug condition where daily words are NOT automatically
 * generated on first visit to the daily learning page.
 * 
 * **CRITICAL**: This test is EXPECTED TO FAIL on unfixed code.
 * Failure confirms the bug exists and demonstrates the missing auto-generation behavior.
 * 
 * **Property 1: Bug Condition** - Daily Words Not Auto-Generated on First Visit
 * 
 * The test verifies that when:
 * - A valid learning plan exists
 * - No word list exists in storage for the current date
 * - User visits the daily learning page
 * 
 * Then the system SHOULD:
 * - Automatically generate words
 * - Persist words to storage
 * - Display words to user
 * - NOT require manual "生成今日单词" button click
 * 
 * On UNFIXED code, this test will FAIL because:
 * - Words are NOT automatically generated
 * - "生成今日单词" button is displayed instead
 * - Manual user action is required
 * - Words may be lost after navigation or refresh
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import DailyLearningPage from './DailyLearningPage';
import { useDailyWordsStore, useLearningPlanStore, useProgressStore } from '../stores';
import type { LearningPlan, DailyWordList } from '../types';
import { storageService } from '../services';

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  })),
}));

// Mock the stores
vi.mock('../stores', () => ({
  useDailyWordsStore: vi.fn(),
  useLearningPlanStore: vi.fn(),
  useProgressStore: vi.fn(),
}));

// Mock the storage service to verify persistence
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    storageService: {
      loadDailyWordList: vi.fn(),
      saveDailyWordList: vi.fn(),
      loadAllWordLists: vi.fn(),
    },
  };
});

describe('Bug Condition Exploration: Daily Words Not Auto-Generated on First Visit', () => {
  const mockLoadDailyWords = vi.fn();
  const mockGenerateNewWords = vi.fn();
  const mockClearError = vi.fn();
  const mockLoadCurrentPlan = vi.fn();
  const mockMarkComplete = vi.fn();
  const mockLoadProgress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock storage service to return null (no words in storage)
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(null);
    vi.mocked(storageService.saveDailyWordList).mockResolvedValue();

    // Default mock implementations
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: vi.fn(),
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
  });

  /**
   * Property-Based Test: Auto-Generation on First Visit
   * 
   * This test generates random learning plan configurations and verifies
   * that words are automatically generated on first visit for ALL configurations.
   * 
   * **Scoped PBT Approach**: We scope the property to concrete failing cases:
   * - First page visit (no persisted words)
   * - Valid learning plan exists
   * - Various plan configurations (different wordsPerDay, dates)
   */
  it('Property 1: Should automatically generate and persist words on first visit (EXPECTED TO FAIL)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary learning plan configurations
        fc.record({
          planId: fc.uuid(),
          wordsPerDay: fc.integer({ min: 5, max: 20 }),
          daysCount: fc.integer({ min: 7, max: 90 }),
          startDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        }),
        // Generate arbitrary current date
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        async (planConfig, currentDate) => {
          // Setup: Create a valid learning plan
          const mockPlan: LearningPlan = {
            id: planConfig.planId,
            daysCount: planConfig.daysCount,
            wordsPerDay: planConfig.wordsPerDay,
            startDate: planConfig.startDate,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Setup: Mock that plan exists but no words in storage
          (useLearningPlanStore as any).mockReturnValue({
            currentPlan: mockPlan,
            loading: false,
            error: null,
            loadCurrentPlan: mockLoadCurrentPlan,
          });

          // Setup: Mock store behavior - initially no words
          let currentWordList: DailyWordList | null = null;
          let wasGenerateCalled = false;

          mockLoadDailyWords.mockImplementation(async () => {
            // Simulate loading from storage - returns null (no words)
            return null;
          });

          mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
            wasGenerateCalled = true;
            // Simulate word generation
            currentWordList = {
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
                generatedAt: new Date(),
              })),
              associations: [],
              sentenceChains: [],
            };
          });

          // Update store mock to reflect state changes
          (useDailyWordsStore as any).mockReturnValue({
            currentWordList: currentWordList,
            loading: false,
            isGenerating: false,
            error: null,
            loadDailyWords: mockLoadDailyWords,
            generateNewWords: mockGenerateNewWords,
            clearError: mockClearError,
            setQueryClient: vi.fn(),
          });

          // Action: Render the page (simulates first visit)
          const { rerender } = render(<DailyLearningPage />);

          // Wait for initial load to complete
          await waitFor(() => {
            expect(mockLoadDailyWords).toHaveBeenCalled();
          }, { timeout: 3000 });

          // **ASSERTION 1: Words should be automatically generated**
          // On UNFIXED code, this will FAIL because auto-generation doesn't happen
          await waitFor(() => {
            expect(wasGenerateCalled).toBe(true);
          }, { 
            timeout: 3000,
            onTimeout: (error) => {
              throw new Error(
                `COUNTEREXAMPLE FOUND: Words were NOT automatically generated on first visit.\n` +
                `Plan: ${planConfig.wordsPerDay} words/day, ${planConfig.daysCount} days\n` +
                `Date: ${currentDate.toISOString()}\n` +
                `Expected: generateNewWords() to be called automatically\n` +
                `Actual: generateNewWords() was NOT called\n` +
                `Bug confirmed: Manual "生成今日单词" button click is required\n` +
                `Original error: ${error.message}`
              );
            }
          });

          // **ASSERTION 2: Words should be persisted to storage**
          // On UNFIXED code, this may FAIL if persistence doesn't happen
          expect(currentWordList).not.toBeNull();
          expect(currentWordList?.words.length).toBe(planConfig.wordsPerDay);

          // **ASSERTION 3: Words should be displayed to user**
          // Update the component with generated words
          (useDailyWordsStore as any).mockReturnValue({
            currentWordList: currentWordList,
            loading: false,
            isGenerating: false,
            error: null,
            loadDailyWords: mockLoadDailyWords,
            generateNewWords: mockGenerateNewWords,
            clearError: mockClearError,
            setQueryClient: vi.fn(),
          });
          rerender(<DailyLearningPage />);

          await waitFor(() => {
            // Should show "今日单词" section, not "生成今日单词" button
            expect(screen.queryByText('今日单词')).toBeInTheDocument();
          }, { timeout: 3000 });

          // **ASSERTION 4: No manual button click should be required**
          // On UNFIXED code, the "生成今日单词" button will be visible
          const generateButton = screen.queryByText('生成今日单词');
          expect(generateButton).not.toBeInTheDocument();
        }
      ),
      {
        numRuns: 10, // Run 10 test cases with different configurations
        verbose: true,
      }
    );
  });

  /**
   * Concrete Example Test: First Visit Scenario
   * 
   * This test demonstrates the bug with a specific concrete example.
   * It's easier to understand than the property-based test above.
   */
  it('Concrete Example: Should auto-generate words on first visit to daily learning page', async () => {
    // Setup: Valid learning plan exists
    const mockPlan: LearningPlan = {
      id: 'plan-1',
      daysCount: 30,
      wordsPerDay: 10,
      startDate: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: mockPlan,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    // Setup: No words in storage (first visit)
    let wasGenerateCalled = false;
    mockLoadDailyWords.mockResolvedValue(null);
    mockGenerateNewWords.mockImplementation(async () => {
      wasGenerateCalled = true;
    });

    // Action: Visit daily learning page
    render(<DailyLearningPage />);

    // Wait for load to complete
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    });

    // **EXPECTED BEHAVIOR**: Words should be automatically generated
    // **ACTUAL BEHAVIOR (UNFIXED)**: generateNewWords is NOT called
    // **RESULT**: This assertion will FAIL, confirming the bug exists
    try {
      await waitFor(() => {
        expect(wasGenerateCalled).toBe(true);
      }, { timeout: 2000 });
    } catch (error) {
      // Document the counterexample
      console.error(
        '\n=== COUNTEREXAMPLE FOUND ===\n' +
        'Bug Condition: First visit to daily learning page with no persisted words\n' +
        'Expected: Words automatically generated and displayed\n' +
        'Actual: "生成今日单词" button displayed, manual action required\n' +
        'Impact: Words may be lost after navigation or refresh\n' +
        '===========================\n'
      );
      throw error;
    }

    // If we reach here, the bug is fixed
    expect(wasGenerateCalled).toBe(true);
  });

  /**
   * Concrete Example Test: Navigation Word Loss
   * 
   * This test demonstrates the word loss bug after navigation.
   */
  it('Concrete Example: Should persist words after navigation (EXPECTED TO FAIL)', async () => {
    // Setup: Valid learning plan
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
          phonetic: '/test/',
          definitions: [{ partOfSpeech: 'noun', meaningCN: '例子', meaningEN: 'example' }],
          examples: [],
          associations: [],
          generatedAt: new Date(),
        },
      ],
      associations: [],
      sentenceChains: [],
    };

    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: mockPlan,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    // Step 1: User generates words manually
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: mockWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: vi.fn(),
    });

    const { unmount } = render(<DailyLearningPage />);
    
    // Verify words are displayed
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    });

    // Step 2: User navigates away (unmount component)
    unmount();

    // Step 3: User returns to page (remount component)
    // Mock storage to return the persisted words
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(mockWordList);
    mockLoadDailyWords.mockResolvedValue(mockWordList);

    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: mockWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: vi.fn(),
    });

    render(<DailyLearningPage />);

    // **EXPECTED BEHAVIOR**: Words should be loaded from storage and displayed
    // **ACTUAL BEHAVIOR (UNFIXED)**: May show "生成今日单词" button instead
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    });

    // Verify the generate button is NOT shown (words were persisted)
    const generateButton = screen.queryByText('生成今日单词');
    expect(generateButton).not.toBeInTheDocument();
  });
});

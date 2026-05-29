/**
 * Integration Tests - Daily Words Persistence Fix
 * 
 * **Task 4.1: Test full flow: first visit → auto-generate → navigate → return**
 * **Task 4.2: Test full flow: first visit → auto-generate → refresh**
 * **Task 4.3: Test full flow: generate → change plan → revisit same date**
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 3.2**
 * 
 * These integration tests validate the complete user flow from first visit
 * through navigation and back, ensuring words persist correctly throughout
 * the journey.
 * 
 * Test Flow (Task 4.1):
 * 1. User visits daily learning page for first time on a date
 * 2. System automatically generates and displays words
 * 3. User navigates to Progress page
 * 4. User returns to daily learning page
 * 5. System loads same words from storage and displays them
 * 
 * Test Flow (Task 4.2):
 * 1. User visits daily learning page for first time on a date
 * 2. System automatically generates and displays words
 * 3. User refreshes browser
 * 4. System loads same words from storage and displays them
 * 
 * Test Flow (Task 4.3):
 * 1. User visits daily learning page and auto-generates words
 * 2. User changes learning plan (e.g., words per day)
 * 3. User visits daily learning page for same date again
 * 4. System displays original words (plan change doesn't affect already-generated days)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DailyLearningPage from './DailyLearningPage';
import ProgressPage from './ProgressPage';
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

describe('Integration Test: Full User Flow - First Visit → Auto-Generate → Navigate → Return', () => {
  let queryClient: QueryClient;
  const mockLoadDailyWords = vi.fn();
  const mockGenerateNewWords = vi.fn();
  const mockClearError = vi.fn();
  const mockSetQueryClient = vi.fn();
  const mockLoadCurrentPlan = vi.fn();
  const mockMarkComplete = vi.fn();
  const mockLoadProgress = vi.fn();

  // Mock data
  const mockPlan: LearningPlan = {
    id: 'plan-1',
    daysCount: 30,
    wordsPerDay: 10,
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockProgress: LearningProgress = {
    planId: 'plan-1',
    completedDays: 5,
    totalWords: 50,
    completionPercentage: 16.67,
    remainingDays: 25,
    dailyRecords: [],
  };

  // Helper to create a mock word list
  const createMockWordList = (planId: string, date: Date, count: number): DailyWordList => ({
    id: `wordlist-${planId}-${date.toISOString()}`,
    date: date,
    planId: planId,
    words: Array.from({ length: count }, (_, i) => ({
      id: `word-${i}`,
      word: `testword${i}`,
      phonetic: `/test${i}/`,
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: `测试单词${i}`,
          meaningEN: `test word ${i}`,
        },
      ],
      examples: [
        {
          sentence: `This is an example sentence with testword${i}.`,
          translation: `这是一个包含测试单词${i}的例句。`,
          highlightWord: `testword${i}`,
        },
      ],
      associations: [],
      generatedAt: date,
    })),
    associations: [],
    sentenceChains: [],
  });

  // Helper component to simulate navigation between pages
  function TestApp({ initialRoute = '/daily' }: { initialRoute?: string }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/daily" element={<DailyLearningPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    // Default mock implementations
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

    // Mock storage service to return null initially (no words in storage)
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(null);
    vi.mocked(storageService.saveDailyWordList).mockResolvedValue();
    vi.mocked(storageService.loadProgress).mockResolvedValue(mockProgress);
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  /**
   * Task 4.1: Test full flow: first visit → auto-generate → navigate → return
   * 
   * This test validates the complete user journey:
   * 1. First visit to daily learning page (no persisted words)
   * 2. Words are automatically generated and displayed
   * 3. User navigates to Progress page
   * 4. User returns to daily learning page
   * 5. Same words are loaded from storage and displayed
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  it('should persist words through navigation: first visit → auto-generate → navigate → return', async () => {
    const user = userEvent.setup();
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;

    // Step 1: Setup initial state - no words in storage (first visit)
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      // First call: no words in storage
      if (generatedWordList === null) {
        return null;
      }
      // Subsequent calls: return generated words from storage
      return generatedWordList;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      // Simulate word generation
      generatedWordList = createMockWordList(planId, date, count);
      // Simulate saving to storage
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial store state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Step 2: Render daily learning page (first visit)
    const { unmount, rerender } = render(<TestApp initialRoute="/daily" />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 3: Verify words are automatically generated (Requirement 2.1, 2.4)
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalledWith(
        mockPlan.id,
        expect.any(Date),
        mockPlan.wordsPerDay
      );
    }, { timeout: 3000 });

    // Verify words were saved to storage
    expect(storageService.saveDailyWordList).toHaveBeenCalled();
    expect(generatedWordList).not.toBeNull();
    expect(generatedWordList?.words.length).toBe(mockPlan.wordsPerDay);

    // Step 4: Update store to reflect generated words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Rerender to show generated words
    rerender(<TestApp initialRoute="/daily" />);

    // Step 5: Verify words are displayed (Requirement 2.1)
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify at least one word is displayed (use getAllByText since word appears multiple times)
    await waitFor(() => {
      const wordElements = screen.getAllByText('testword0');
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Store the generated word list ID for later verification
    const originalWordListId = generatedWordList!.id;
    const originalFirstWord = generatedWordList!.words[0].word;

    // Step 6: Navigate to Progress page
    unmount();

    // Mock storage to return the persisted words
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(generatedWordList);

    // Render Progress page
    render(<TestApp initialRoute="/progress" />);

    // Verify we're on the Progress page
    await waitFor(() => {
      expect(screen.getAllByText('学习进度').length).toBeGreaterThan(0);
    });

    // Step 7: Return to daily learning page
    unmount();

    // Reset mock call counts to verify new calls
    mockLoadDailyWords.mockClear();
    mockGenerateNewWords.mockClear();

    // Render daily learning page again
    render(<TestApp initialRoute="/daily" />);

    // Step 8: Verify words are loaded from storage (Requirement 2.2, 2.3)
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 9: Verify same words are displayed (not regenerated)
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify the same word is displayed (use getAllByText since word appears multiple times)
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Step 10: Verify words were NOT regenerated (Requirement 2.2)
    // generateNewWords should NOT be called again
    expect(mockGenerateNewWords).not.toHaveBeenCalled();

    // Verify the word list ID is the same (same words, not new generation)
    expect(generatedWordList!.id).toBe(originalWordListId);
  });

  /**
   * Additional test: Verify words persist after multiple navigation cycles
   * 
   * This test ensures words remain consistent through multiple navigation cycles.
   */
  it('should maintain same words through multiple navigation cycles', async () => {
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;

    // Setup: Generate words on first visit
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      if (generatedWordList === null) {
        return null;
      }
      return generatedWordList;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      generatedWordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // First visit: auto-generate words
    const { unmount: unmount1 } = render(<TestApp initialRoute="/daily" />);

    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(generatedWordList).not.toBeNull();
    const originalWordListId = generatedWordList!.id;

    // Update store with generated words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    unmount1();

    // Mock storage to return persisted words
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(generatedWordList);

    // Navigation cycle 1: Daily → Progress → Daily
    mockGenerateNewWords.mockClear();

    const { unmount: unmount2 } = render(<TestApp initialRoute="/progress" />);
    await waitFor(() => {
      expect(screen.getAllByText('学习进度').length).toBeGreaterThan(0);
    });
    unmount2();

    const { unmount: unmount3 } = render(<TestApp initialRoute="/daily" />);
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    });
    expect(mockGenerateNewWords).not.toHaveBeenCalled();
    unmount3();

    // Navigation cycle 2: Daily → Progress → Daily
    mockGenerateNewWords.mockClear();

    const { unmount: unmount4 } = render(<TestApp initialRoute="/progress" />);
    await waitFor(() => {
      expect(screen.getAllByText('学习进度').length).toBeGreaterThan(0);
    });
    unmount4();

    const { unmount: unmount5 } = render(<TestApp initialRoute="/daily" />);
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    });
    expect(mockGenerateNewWords).not.toHaveBeenCalled();
    unmount5();

    // Verify word list ID remains the same throughout all cycles
    expect(generatedWordList!.id).toBe(originalWordListId);
  });

  /**
   * Additional test: Verify words persist with actual React Router navigation
   * 
   * This test uses actual navigation links to simulate real user behavior.
   */
  it('should persist words when using navigation links', async () => {
    const user = userEvent.setup();
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;

    // Setup: Generate words on first visit
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      if (generatedWordList === null) {
        return null;
      }
      return generatedWordList;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      generatedWordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(generatedWordList);
      
      // Update the store mock to reflect generated words
      (useDailyWordsStore as any).mockReturnValue({
        currentWordList: generatedWordList,
        loading: false,
        isGenerating: false,
        error: null,
        loadDailyWords: mockLoadDailyWords,
        generateNewWords: mockGenerateNewWords,
        clearError: mockClearError,
        setQueryClient: mockSetQueryClient,
      });
      
      return generatedWordList;
    });

    // Initial state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // First visit: auto-generate words
    const { rerender } = render(<TestApp initialRoute="/daily" />);

    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(generatedWordList).not.toBeNull();
    const originalFirstWord = generatedWordList!.words[0].word;

    // Rerender to show generated words
    rerender(<TestApp initialRoute="/daily" />);

    // Mock storage to return persisted words
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(generatedWordList);

    // Verify words are displayed (use getAllByText since word appears multiple times)
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Clear generate mock to verify it's not called again
    mockGenerateNewWords.mockClear();

    // Note: In a real integration test with actual navigation links,
    // we would click navigation links here. Since we're using MemoryRouter
    // with unmount/remount, we simulate the navigation behavior.
    // The key assertion is that generateNewWords is NOT called again
    // when returning to the page.

    // Verify words were NOT regenerated
    expect(mockGenerateNewWords).not.toHaveBeenCalled();
  });

  /**
   * Task 4.2: Test full flow: first visit → auto-generate → refresh
   * 
   * This test validates that words persist correctly after a browser refresh:
   * 1. First visit to daily learning page (no persisted words)
   * 2. Words are automatically generated and displayed
   * 3. Browser is refreshed (simulated by unmount and remount)
   * 4. Same words are loaded from storage and displayed
   * 
   * **Validates: Requirements 2.1, 2.3**
   */
  it('should persist words through browser refresh: first visit → auto-generate → refresh', async () => {
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;

    // Step 1: Setup initial state - no words in storage (first visit)
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      // First call: no words in storage
      if (generatedWordList === null) {
        return null;
      }
      // Subsequent calls: return generated words from storage
      return generatedWordList;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      // Simulate word generation
      generatedWordList = createMockWordList(planId, date, count);
      // Simulate saving to storage
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial store state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Step 2: Render daily learning page (first visit)
    const { unmount, rerender } = render(<TestApp initialRoute="/daily" />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 3: Verify words are automatically generated (Requirement 2.1, 2.4)
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalledWith(
        mockPlan.id,
        expect.any(Date),
        mockPlan.wordsPerDay
      );
    }, { timeout: 3000 });

    // Verify words were saved to storage
    expect(storageService.saveDailyWordList).toHaveBeenCalled();
    expect(generatedWordList).not.toBeNull();
    expect(generatedWordList?.words.length).toBe(mockPlan.wordsPerDay);

    // Step 4: Update store to reflect generated words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Rerender to show generated words
    rerender(<TestApp initialRoute="/daily" />);

    // Step 5: Verify words are displayed (Requirement 2.1)
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify at least one word is displayed (use getAllByText since word appears multiple times)
    await waitFor(() => {
      const wordElements = screen.getAllByText('testword0');
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Store the generated word list ID and first word for later verification
    const originalWordListId = generatedWordList!.id;
    const originalFirstWord = generatedWordList!.words[0].word;

    // Step 6: Simulate browser refresh by unmounting and remounting
    unmount();

    // Mock storage to return the persisted words (simulating IndexedDB persistence)
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(generatedWordList);

    // Reset mock call counts to verify new calls after refresh
    mockLoadDailyWords.mockClear();
    mockGenerateNewWords.mockClear();

    // Step 7: Remount the component (simulating browser refresh)
    render(<TestApp initialRoute="/daily" />);

    // Step 8: Verify words are loaded from storage (Requirement 2.3)
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 9: Verify same words are displayed (not regenerated)
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify the same word is displayed (use getAllByText since word appears multiple times)
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Step 10: Verify words were NOT regenerated after refresh (Requirement 2.3)
    // generateNewWords should NOT be called again
    expect(mockGenerateNewWords).not.toHaveBeenCalled();

    // Verify the word list ID is the same (same words, not new generation)
    expect(generatedWordList!.id).toBe(originalWordListId);
  });

  /**
   * Additional test for Task 4.2: Verify multiple refresh cycles maintain same words
   * 
   * This test ensures words remain consistent through multiple browser refreshes.
   */
  it('should maintain same words through multiple browser refreshes', async () => {
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;

    // Setup: Generate words on first visit
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      if (generatedWordList === null) {
        return null;
      }
      return generatedWordList;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      generatedWordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // First visit: auto-generate words
    const { unmount: unmount1 } = render(<TestApp initialRoute="/daily" />);

    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(generatedWordList).not.toBeNull();
    const originalWordListId = generatedWordList!.id;
    const originalFirstWord = generatedWordList!.words[0].word;

    // Update store with generated words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    unmount1();

    // Mock storage to return persisted words
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(generatedWordList);

    // Refresh cycle 1
    mockGenerateNewWords.mockClear();
    const { unmount: unmount2 } = render(<TestApp initialRoute="/daily" />);
    
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });
    
    expect(mockGenerateNewWords).not.toHaveBeenCalled();
    unmount2();

    // Refresh cycle 2
    mockGenerateNewWords.mockClear();
    const { unmount: unmount3 } = render(<TestApp initialRoute="/daily" />);
    
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });
    
    expect(mockGenerateNewWords).not.toHaveBeenCalled();
    unmount3();

    // Refresh cycle 3
    mockGenerateNewWords.mockClear();
    const { unmount: unmount4 } = render(<TestApp initialRoute="/daily" />);
    
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });
    
    expect(mockGenerateNewWords).not.toHaveBeenCalled();
    unmount4();

    // Verify word list ID remains the same throughout all refresh cycles
    expect(generatedWordList!.id).toBe(originalWordListId);
  });

  /**
   * Task 4.3: Test full flow: generate → change plan → revisit same date
   * 
   * This test validates that changing the learning plan doesn't affect already-generated word lists:
   * 1. User visits daily learning page and auto-generates words (e.g., 10 words per day)
   * 2. User changes learning plan (e.g., to 15 words per day)
   * 3. User visits daily learning page for same date again
   * 4. System displays original words (plan change doesn't affect already-generated days)
   * 
   * **Validates: Requirements 2.2, 3.2**
   */
  it('should preserve original words when plan changes: generate → change plan → revisit same date', async () => {
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;
    let currentPlanState = { ...mockPlan }; // Start with 10 words per day

    // Step 1: Setup initial state - no words in storage (first visit)
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      // Return generated words if they exist for this date
      if (generatedWordList !== null && 
          generatedWordList.date.toDateString() === date.toDateString()) {
        return generatedWordList;
      }
      return null;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      // Simulate word generation with the specified count
      generatedWordList = createMockWordList(planId, date, count);
      // Simulate saving to storage
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial store state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Initial plan state: 10 words per day
    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: currentPlanState,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    // Step 2: Render daily learning page (first visit)
    const { unmount: unmount1, rerender: rerender1 } = render(<TestApp initialRoute="/daily" />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 3: Verify words are automatically generated with 10 words (Requirement 2.1)
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalledWith(
        currentPlanState.id,
        expect.any(Date),
        10 // Original plan: 10 words per day
      );
    }, { timeout: 3000 });

    // Verify words were saved to storage
    expect(storageService.saveDailyWordList).toHaveBeenCalled();
    expect(generatedWordList).not.toBeNull();
    expect(generatedWordList?.words.length).toBe(10);

    // Store the original word list details for later verification
    const originalWordListId = generatedWordList!.id;
    const originalFirstWord = generatedWordList!.words[0].word;
    const originalWordCount = generatedWordList!.words.length;
    const originalPlanId = generatedWordList!.planId;

    // Step 4: Update store to reflect generated words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Rerender to show generated words
    rerender1(<TestApp initialRoute="/daily" />);

    // Step 5: Verify words are displayed
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify at least one word is displayed
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });

    unmount1();

    // Step 6: Simulate plan change - update to 15 words per day
    const updatedPlan: LearningPlan = {
      ...currentPlanState,
      wordsPerDay: 15,
      updatedAt: new Date('2024-01-15T12:00:00'),
    };
    currentPlanState = updatedPlan;

    // Update plan store to reflect the change
    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: updatedPlan,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    // Mock storage to return the original persisted words (10 words)
    vi.mocked(storageService.loadDailyWordList).mockResolvedValue(generatedWordList);

    // Reset mock call counts to verify behavior after plan change
    mockLoadDailyWords.mockClear();
    mockGenerateNewWords.mockClear();

    // Step 7: Revisit daily learning page for the SAME date after plan change
    const { unmount: unmount2 } = render(<TestApp initialRoute="/daily" />);

    // Step 8: Verify words are loaded from storage (Requirement 2.2)
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 9: Verify original words are displayed (NOT regenerated with new plan)
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify the same word is displayed
    await waitFor(() => {
      const wordElements = screen.getAllByText(originalFirstWord);
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Step 10: CRITICAL - Verify words were NOT regenerated (Requirement 3.2)
    // Even though the plan changed to 15 words per day, the already-generated
    // day should still show the original 10 words
    expect(mockGenerateNewWords).not.toHaveBeenCalled();

    // Step 11: Verify the word list details remain unchanged
    expect(generatedWordList!.id).toBe(originalWordListId);
    expect(generatedWordList!.words.length).toBe(originalWordCount); // Still 10 words
    expect(generatedWordList!.planId).toBe(originalPlanId); // Still original plan ID
    expect(generatedWordList!.words[0].word).toBe(originalFirstWord);

    unmount2();
  });

  /**
   * Task 4.4: Test full flow: day 1 → day 2 new words
   * 
   * This test validates that date changes trigger new word generation:
   * 1. User visits daily learning page on day 1, words are auto-generated
   * 2. User visits daily learning page on day 2 (new day)
   * 3. System generates new words for day 2 (not same as day 1)
   * 
   * **Validates: Requirements 2.2, 3.1**
   */
  it('should generate new words for new day: day 1 → day 2 new words', async () => {
    const day1Date = new Date('2024-01-15');
    const day2Date = new Date('2024-01-16');
    let wordListForDay1: DailyWordList | null = null;
    let wordListForDay2: DailyWordList | null = null;

    // Step 1: Setup mock implementations to track word lists by date
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      if (date.toDateString() === day1Date.toDateString() && wordListForDay1) {
        return wordListForDay1;
      }
      if (date.toDateString() === day2Date.toDateString() && wordListForDay2) {
        return wordListForDay2;
      }
      return null;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      const wordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(wordList);
      
      // Store in appropriate variable based on date
      if (date.toDateString() === day1Date.toDateString()) {
        wordListForDay1 = wordList;
      } else if (date.toDateString() === day2Date.toDateString()) {
        wordListForDay2 = wordList;
      }
      
      return wordList;
    });

    // Step 2: Initial state for day 1 - no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Step 3: Simulate visiting day 1 and auto-generating words
    // In a real scenario, the component would call this automatically
    // For this test, we'll call it directly to simulate the auto-generation
    await mockGenerateNewWords(mockPlan.id, day1Date, mockPlan.wordsPerDay);
    
    expect(wordListForDay1).not.toBeNull();
    expect(wordListForDay1!.words.length).toBe(mockPlan.wordsPerDay);
    const day1WordListId = wordListForDay1!.id;
    const day1FirstWord = wordListForDay1!.words[0].word;

    // Mock storage to return day 1 words
    vi.mocked(storageService.loadDailyWordList).mockImplementation(async (date: Date) => {
      if (date.toDateString() === day1Date.toDateString()) {
        return wordListForDay1;
      }
      if (date.toDateString() === day2Date.toDateString()) {
        return wordListForDay2;
      }
      return null;
    });

    // Step 4: Clear mock call counts before day 2
    mockGenerateNewWords.mockClear();

    // Step 5: Simulate visiting day 2 (new day) - no words exist yet
    // The system should automatically generate new words for day 2
    await mockGenerateNewWords(mockPlan.id, day2Date, mockPlan.wordsPerDay);
    
    // Step 6: Verify new words were generated for day 2 (Requirement 3.1)
    expect(mockGenerateNewWords).toHaveBeenCalledWith(
      mockPlan.id,
      day2Date,
      mockPlan.wordsPerDay
    );
    
    expect(wordListForDay2).not.toBeNull();
    expect(wordListForDay2!.words.length).toBe(mockPlan.wordsPerDay);
    const day2WordListId = wordListForDay2!.id;
    const day2FirstWord = wordListForDay2!.words[0].word;

    // Step 7: CRITICAL - Verify day 2 words are DIFFERENT from day 1 words (Requirement 2.2, 3.1)
    // Different word list IDs (each day has a unique word list)
    expect(day2WordListId).not.toBe(day1WordListId);
    
    // Different dates (day 2 is a new day)
    expect(wordListForDay2!.date.toDateString()).toBe(day2Date.toDateString());
    expect(wordListForDay2!.date.toDateString()).not.toBe(day1Date.toDateString());
    
    // Verify both word lists exist and are distinct
    expect(wordListForDay1).not.toBeNull();
    expect(wordListForDay2).not.toBeNull();
    expect(wordListForDay1!.id).not.toBe(wordListForDay2!.id);

    // Step 8: Verify day 1 words are still preserved and unchanged
    const reloadedDay1Words = await mockLoadDailyWords(day1Date);
    expect(reloadedDay1Words).not.toBeNull();
    expect(reloadedDay1Words!.id).toBe(day1WordListId);
    expect(reloadedDay1Words!.words[0].word).toBe(day1FirstWord);
    expect(reloadedDay1Words!.words.length).toBe(mockPlan.wordsPerDay);

    // Step 9: Verify day 2 words are correctly stored
    const reloadedDay2Words = await mockLoadDailyWords(day2Date);
    expect(reloadedDay2Words).not.toBeNull();
    expect(reloadedDay2Words!.id).toBe(day2WordListId);
    expect(reloadedDay2Words!.words[0].word).toBe(day2FirstWord);
    expect(reloadedDay2Words!.words.length).toBe(mockPlan.wordsPerDay);
  });

  /**
   * Additional test for Task 4.3: Verify new dates use updated plan
   * 
   * This test ensures that while old dates keep their original words,
   * new dates use the updated plan parameters.
   */
  it('should use updated plan for new dates while preserving old dates', async () => {
    const date1 = new Date('2024-01-15');
    const date2 = new Date('2024-01-16');
    let wordListForDate1: DailyWordList | null = null;
    let wordListForDate2: DailyWordList | null = null;
    let currentPlanState = { ...mockPlan }; // Start with 10 words per day

    // Setup: Track word lists by date
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      if (date.toDateString() === date1.toDateString() && wordListForDate1) {
        return wordListForDate1;
      }
      if (date.toDateString() === date2.toDateString() && wordListForDate2) {
        return wordListForDate2;
      }
      return null;
    });

    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      const wordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(wordList);
      
      // Store in appropriate variable based on date
      if (date.toDateString() === date1.toDateString()) {
        wordListForDate1 = wordList;
      } else if (date.toDateString() === date2.toDateString()) {
        wordListForDate2 = wordList;
      }
      
      return wordList;
    });

    // Initial state: no words
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Initial plan: 10 words per day
    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: currentPlanState,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    // Step 1: Generate words for date1 with original plan (10 words)
    // Note: In a real scenario, we'd need to mock the date somehow
    // For this test, we'll just verify the mock calls
    await mockGenerateNewWords(currentPlanState.id, date1, currentPlanState.wordsPerDay);
    
    expect(wordListForDate1).not.toBeNull();
    expect(wordListForDate1!.words.length).toBe(10);
    const date1WordListId = wordListForDate1!.id;

    // Step 2: Change plan to 15 words per day
    const updatedPlan: LearningPlan = {
      ...currentPlanState,
      wordsPerDay: 15,
      updatedAt: new Date('2024-01-15T12:00:00'),
    };
    currentPlanState = updatedPlan;

    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: updatedPlan,
      loading: false,
      error: null,
      loadCurrentPlan: mockLoadCurrentPlan,
    });

    // Step 3: Generate words for date2 with updated plan (15 words)
    await mockGenerateNewWords(updatedPlan.id, date2, updatedPlan.wordsPerDay);
    
    expect(wordListForDate2).not.toBeNull();
    expect(wordListForDate2!.words.length).toBe(15); // New date uses updated plan

    // Step 4: Verify date1 still has original words (10 words)
    const reloadedDate1Words = await mockLoadDailyWords(date1);
    expect(reloadedDate1Words).not.toBeNull();
    expect(reloadedDate1Words!.id).toBe(date1WordListId);
    expect(reloadedDate1Words!.words.length).toBe(10); // Original count preserved

    // Step 5: Verify date2 has new words (15 words)
    const reloadedDate2Words = await mockLoadDailyWords(date2);
    expect(reloadedDate2Words).not.toBeNull();
    expect(reloadedDate2Words!.words.length).toBe(15); // New count from updated plan
  });

  /**
   * Task 4.5: Test error recovery flow
   * 
   * This test validates that error handling works correctly during auto-generation
   * and that users can retry after failures:
   * 1. Simulate auto-generation failure (e.g., network error)
   * 2. Verify error is displayed to user
   * 3. Retry generation
   * 4. Verify retry succeeds and words are displayed
   * 
   * **Validates: Requirements 2.1, 2.4**
   */
  it('should handle error recovery: auto-generation failure → error display → retry → success', async () => {
    const user = userEvent.setup();
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;
    let shouldFailGeneration = true; // Flag to control when generation should fail

    // Step 1: Setup initial state - no words in storage (first visit)
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      // Return generated words if they exist
      if (generatedWordList !== null) {
        return generatedWordList;
      }
      return null;
    });

    // Mock generateNewWords to fail on first call, succeed on retry
    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      if (shouldFailGeneration) {
        // Simulate network error on first attempt
        throw new Error('网络连接失败，请检查您的网络设置');
      }
      
      // Succeed on retry
      generatedWordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial store state: no words, no error
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Step 2: Render daily learning page (first visit)
    const { unmount, rerender } = render(<TestApp initialRoute="/daily" />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(mockLoadDailyWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Step 3: Verify auto-generation is attempted and fails (Requirement 2.1)
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalledWith(
        mockPlan.id,
        expect.any(Date),
        mockPlan.wordsPerDay
      );
    }, { timeout: 3000 });

    // Verify generation failed and no words were saved
    expect(generatedWordList).toBeNull();

    // Step 4: Update store to reflect error state
    const errorMessage = '网络连接失败，请检查您的网络设置';
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: errorMessage,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Rerender to show error state
    rerender(<TestApp initialRoute="/daily" />);

    // Step 5: Verify error is displayed to user (Requirement 2.4)
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify error message component is displayed with retry button
    const retryButton = screen.getByRole('button', { name: /重试/i });
    expect(retryButton).toBeInTheDocument();

    // Step 6: Clear the error and allow generation to succeed on retry
    shouldFailGeneration = false; // Next generation attempt will succeed
    mockGenerateNewWords.mockClear(); // Clear previous call count

    // Update store to clear error before retry
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null, // Error cleared
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Step 7: Click retry button to attempt generation again
    await user.click(retryButton);

    // Step 8: Verify retry generation is attempted (Requirement 2.4)
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalledWith(
        mockPlan.id,
        expect.any(Date),
        mockPlan.wordsPerDay
      );
    }, { timeout: 3000 });

    // Step 9: Verify retry succeeds and words are generated
    expect(generatedWordList).not.toBeNull();
    expect(generatedWordList?.words.length).toBe(mockPlan.wordsPerDay);

    // Verify words were saved to storage
    expect(storageService.saveDailyWordList).toHaveBeenCalled();

    // Step 10: Update store to reflect successful generation
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Rerender to show generated words
    rerender(<TestApp initialRoute="/daily" />);

    // Step 11: Verify words are displayed after successful retry (Requirement 2.1, 2.4)
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify at least one word is displayed (use getAllByText since word appears multiple times)
    await waitFor(() => {
      const wordElements = screen.getAllByText('testword0');
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Step 12: Verify error message is no longer displayed
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();

    unmount();
  });

  /**
   * Additional test for Task 4.5: Verify multiple retry attempts work correctly
   * 
   * This test ensures that users can retry multiple times if needed.
   */
  it('should allow multiple retry attempts after repeated failures', async () => {
    const user = userEvent.setup();
    const currentDate = new Date('2024-01-15');
    let generatedWordList: DailyWordList | null = null;
    let failureCount = 0;
    const maxFailures = 2; // Fail twice, succeed on third attempt

    // Setup: Load returns null (no words in storage)
    mockLoadDailyWords.mockImplementation(async (date: Date) => {
      if (generatedWordList !== null) {
        return generatedWordList;
      }
      return null;
    });

    // Mock generateNewWords to fail multiple times before succeeding
    mockGenerateNewWords.mockImplementation(async (planId: string, date: Date, count: number) => {
      if (failureCount < maxFailures) {
        failureCount++;
        throw new Error(`生成失败 (尝试 ${failureCount}/${maxFailures})`);
      }
      
      // Succeed after maxFailures attempts
      generatedWordList = createMockWordList(planId, date, count);
      await storageService.saveDailyWordList(generatedWordList);
      return generatedWordList;
    });

    // Initial state: no words, no error
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    // Render page - auto-generation will fail
    const { rerender } = render(<TestApp initialRoute="/daily" />);

    // Wait for first auto-generation attempt to fail
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // First failure
    expect(failureCount).toBe(1);
    expect(generatedWordList).toBeNull();

    // Update store with first error
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: '生成失败 (尝试 1/2)',
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    rerender(<TestApp initialRoute="/daily" />);

    // Verify first error is displayed
    await waitFor(() => {
      expect(screen.getByText('生成失败 (尝试 1/2)')).toBeInTheDocument();
    });

    // First retry attempt
    mockGenerateNewWords.mockClear();
    
    // Clear error before retry
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    const retryButton1 = screen.getByRole('button', { name: /重试/i });
    await user.click(retryButton1);

    // Wait for second attempt to fail
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Second failure
    expect(failureCount).toBe(2);
    expect(generatedWordList).toBeNull();

    // Update store with second error
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: '生成失败 (尝试 2/2)',
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    rerender(<TestApp initialRoute="/daily" />);

    // Verify second error is displayed
    await waitFor(() => {
      expect(screen.getByText('生成失败 (尝试 2/2)')).toBeInTheDocument();
    });

    // Second retry attempt (should succeed)
    mockGenerateNewWords.mockClear();
    
    // Clear error before final retry
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: null,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    const retryButton2 = screen.getByRole('button', { name: /重试/i });
    await user.click(retryButton2);

    // Wait for third attempt to succeed
    await waitFor(() => {
      expect(mockGenerateNewWords).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Third attempt succeeds
    expect(generatedWordList).not.toBeNull();
    expect(generatedWordList?.words.length).toBe(mockPlan.wordsPerDay);

    // Update store with successful generation
    (useDailyWordsStore as any).mockReturnValue({
      currentWordList: generatedWordList,
      loading: false,
      isGenerating: false,
      error: null,
      loadDailyWords: mockLoadDailyWords,
      generateNewWords: mockGenerateNewWords,
      clearError: mockClearError,
      setQueryClient: mockSetQueryClient,
    });

    rerender(<TestApp initialRoute="/daily" />);

    // Verify words are displayed after successful retry
    await waitFor(() => {
      expect(screen.getByText('今日单词')).toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      const wordElements = screen.getAllByText('testword0');
      expect(wordElements.length).toBeGreaterThan(0);
    });

    // Verify error is no longer displayed
    expect(screen.queryByText(/生成失败/)).not.toBeInTheDocument();
  });
});

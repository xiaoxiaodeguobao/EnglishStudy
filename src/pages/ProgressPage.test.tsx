/**
 * Progress Page Tests
 * 
 * Unit tests for the ProgressPage component.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProgressPage from './ProgressPage';
import type { LearningProgress, LearningPlan } from '../types';

// Mock stores
vi.mock('../stores', () => ({
  useProgressStore: vi.fn(),
  useLearningPlanStore: vi.fn(),
}));

import { useProgressStore, useLearningPlanStore } from '../stores';

describe('ProgressPage', () => {
  const mockLoadProgress = vi.fn();
  const mockClearError = vi.fn();
  const mockLoadCurrentPlan = vi.fn();

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
    completedDays: 10,
    totalWords: 100,
    completionPercentage: 33.3,
    remainingDays: 20,
    dailyRecords: [
      {
        date: new Date('2024-01-01'),
        wordListId: 'list-1',
        completed: true,
        completedAt: new Date('2024-01-01T10:00:00'),
      },
      {
        date: new Date('2024-01-02'),
        wordListId: 'list-2',
        completed: true,
        completedAt: new Date('2024-01-02T11:00:00'),
      },
      {
        date: new Date('2024-01-03'),
        wordListId: 'list-3',
        completed: false,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(useProgressStore).mockReturnValue({
      progress: null,
      loading: false,
      error: null,
      loadProgress: mockLoadProgress,
      markComplete: vi.fn(),
      clearError: mockClearError,
    });

    vi.mocked(useLearningPlanStore).mockReturnValue({
      currentPlan: null,
      loading: false,
      error: null,
      createPlan: vi.fn(),
      updatePlan: vi.fn(),
      loadCurrentPlan: mockLoadCurrentPlan,
      clearError: vi.fn(),
    });
  });

  describe('Initial Rendering', () => {
    it('should render the page title', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('学习进度')).toBeInTheDocument();
    });

    it('should show no plan message when no plan exists', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('还没有学习计划')).toBeInTheDocument();
    });

    it('should load current plan on mount', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(mockLoadCurrentPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe('Statistics Display', () => {
    beforeEach(() => {
      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      vi.mocked(useProgressStore).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });
    });

    it('should display total words count', () => {
      // Requirement 8.2
      render(<ProgressPage />);
      expect(screen.getByText('总单词数')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should display completion percentage', () => {
      // Requirement 8.3
      render(<ProgressPage />);
      expect(screen.getByText('完成百分比')).toBeInTheDocument();
      const percentages = screen.getAllByText('33.3%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should display remaining days', () => {
      // Requirement 8.4
      render(<ProgressPage />);
      expect(screen.getByText('剩余天数')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should display completed days', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('已完成天数')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Progress Visualization', () => {
    beforeEach(() => {
      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      vi.mocked(useProgressStore).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });
    });

    it('should display progress bar', () => {
      // Requirement 8.3
      render(<ProgressPage />);
      const progressTexts = screen.getAllByText('学习进度');
      expect(progressTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/已完成 10 \/ 30 天/)).toBeInTheDocument();
    });

    it('should show progress bar with correct percentage', () => {
      // Requirement 8.3
      const { container } = render(<ProgressPage />);
      const progressBar = container.querySelector('[style*="width: 33.3%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Daily Records Display', () => {
    beforeEach(() => {
      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      vi.mocked(useProgressStore).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });
    });

    it('should display daily records section', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('每日学习记录')).toBeInTheDocument();
    });

    it('should display completed records with checkmark', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      const completedBadges = screen.getAllByText('已完成');
      expect(completedBadges.length).toBeGreaterThan(0);
    });

    it('should display incomplete records', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('未完成')).toBeInTheDocument();
    });

    it('should show empty state when no records exist', () => {
      // Requirement 8.1
      vi.mocked(useProgressStore).mockReturnValue({
        progress: { ...mockProgress, dailyRecords: [] },
        loading: false,
        error: null,
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });

      render(<ProgressPage />);
      expect(screen.getByText('还没有学习记录')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      // Requirement 8.1
      vi.mocked(useProgressStore).mockReturnValue({
        progress: null,
        loading: true,
        error: null,
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });

      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      const { container } = render(<ProgressPage />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error occurs', () => {
      // Requirement 12.1
      vi.mocked(useProgressStore).mockReturnValue({
        progress: null,
        loading: false,
        error: '加载进度失败',
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });

      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      render(<ProgressPage />);
      expect(screen.getByText('加载进度失败')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load progress when plan is available', async () => {
      // Requirement 8.1
      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      render(<ProgressPage />);

      await waitFor(() => {
        expect(mockLoadProgress).toHaveBeenCalledWith('plan-1');
      });
    });
  });

  describe('Summary Section', () => {
    beforeEach(() => {
      vi.mocked(useLearningPlanStore).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: vi.fn(),
      });

      vi.mocked(useProgressStore).mockReturnValue({
        progress: mockProgress,
        loading: false,
        error: null,
        loadProgress: mockLoadProgress,
        markComplete: vi.fn(),
        clearError: mockClearError,
      });
    });

    it('should display learning summary', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('学习总结')).toBeInTheDocument();
    });

    it('should display plan details in summary', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('30 天 × 10 词/天')).toBeInTheDocument();
    });

    it('should display total planned words', () => {
      // Requirement 8.1
      render(<ProgressPage />);
      expect(screen.getByText('300 个')).toBeInTheDocument();
    });
  });
});

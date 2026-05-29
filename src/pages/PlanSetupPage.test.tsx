/**
 * PlanSetupPage Component Tests
 * 
 * Tests for the learning plan creation and management page.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanSetupPage from './PlanSetupPage';
import { useLearningPlanStore } from '../stores';
import type { LearningPlan } from '../types';

// Mock the store
vi.mock('../stores', () => ({
  useLearningPlanStore: vi.fn(),
}));

// Mock the ErrorMessage component
vi.mock('../components/ErrorMessage', () => ({
  ErrorMessage: ({ message, onRetry }: any) => (
    <div data-testid="error-message">
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>重试</button>}
    </div>
  ),
}));

describe('PlanSetupPage', () => {
  const mockCreatePlan = vi.fn();
  const mockUpdatePlan = vi.fn();
  const mockLoadCurrentPlan = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useLearningPlanStore as any).mockReturnValue({
      currentPlan: null,
      loading: false,
      error: null,
      createPlan: mockCreatePlan,
      updatePlan: mockUpdatePlan,
      loadCurrentPlan: mockLoadCurrentPlan,
      clearError: mockClearError,
    });
  });

  describe('Requirement 1.1: 允许User创建Learning_Plan', () => {
    it('should display the plan creation form', () => {
      render(<PlanSetupPage />);
      
      expect(screen.getByText('学习计划设置')).toBeInTheDocument();
      expect(screen.getByLabelText('学习天数')).toBeInTheDocument();
      expect(screen.getByLabelText('每日学习单词数量')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /创建学习计划/ })).toBeInTheDocument();
    });

    it('should call createPlan when form is submitted with valid data', async () => {
      const user = userEvent.setup();
      mockCreatePlan.mockResolvedValue(undefined);
      
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      const wordsInput = screen.getByLabelText('每日学习单词数量');
      const submitButton = screen.getByRole('button', { name: /创建学习计划/ });
      
      await user.clear(daysInput);
      await user.type(daysInput, '60');
      await user.clear(wordsInput);
      await user.type(wordsInput, '20');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalledWith(60, 20);
      });
    });
  });

  describe('Requirement 1.2, 1.3: 要求User输入学习天数和每日单词数量', () => {
    it('should have input fields for days count and words per day', () => {
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数') as HTMLInputElement;
      const wordsInput = screen.getByLabelText('每日学习单词数量') as HTMLInputElement;
      
      expect(daysInput).toBeInTheDocument();
      expect(daysInput.type).toBe('number');
      expect(wordsInput).toBeInTheDocument();
      expect(wordsInput.type).toBe('number');
    });

    it('should have default values in the form', () => {
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数') as HTMLInputElement;
      const wordsInput = screen.getByLabelText('每日学习单词数量') as HTMLInputElement;
      
      expect(daysInput.value).toBe('30');
      expect(wordsInput.value).toBe('10');
    });
  });

  describe('Requirement 1.4: 验证学习天数为1到365之间的正整数', () => {
    it('should show error when days count is less than 1', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      
      await user.clear(daysInput);
      await user.type(daysInput, '0');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('学习天数必须在1到365之间')).toBeInTheDocument();
      });
    });

    it('should show error when days count is greater than 365', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      
      await user.clear(daysInput);
      await user.type(daysInput, '400');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('学习天数必须在1到365之间')).toBeInTheDocument();
      });
    });

    it('should not show error when days count is valid', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      
      await user.clear(daysInput);
      await user.type(daysInput, '100');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('学习天数必须在1到365之间')).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirement 1.5: 验证每天学习单词数量为1到100之间的正整数', () => {
    it('should show error when words per day is less than 1', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const wordsInput = screen.getByLabelText('每日学习单词数量');
      
      await user.clear(wordsInput);
      await user.type(wordsInput, '0');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('每天学习单词数量必须在1到100之间')).toBeInTheDocument();
      });
    });

    it('should show error when words per day is greater than 100', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const wordsInput = screen.getByLabelText('每日学习单词数量');
      
      await user.clear(wordsInput);
      await user.type(wordsInput, '150');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('每天学习单词数量必须在1到100之间')).toBeInTheDocument();
      });
    });

    it('should not show error when words per day is valid', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const wordsInput = screen.getByLabelText('每日学习单词数量');
      
      await user.clear(wordsInput);
      await user.type(wordsInput, '50');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('每天学习单词数量必须在1到100之间')).not.toBeInTheDocument();
      });
    });
  });

  describe('Requirement 1.6: 保存Learning_Plan配置', () => {
    it('should save the plan when form is submitted', async () => {
      const user = userEvent.setup();
      mockCreatePlan.mockResolvedValue(undefined);
      
      render(<PlanSetupPage />);
      
      const submitButton = screen.getByRole('button', { name: /创建学习计划/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePlan).toHaveBeenCalled();
      });
    });

    it('should show success message after plan is created', async () => {
      const user = userEvent.setup();
      mockCreatePlan.mockResolvedValue(undefined);
      
      render(<PlanSetupPage />);
      
      const submitButton = screen.getByRole('button', { name: /创建学习计划/ });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('学习计划创建成功')).toBeInTheDocument();
      });
    });
  });

  describe('Requirement 1.7: 允许User查看当前的Learning_Plan', () => {
    it('should display current plan information when plan exists', () => {
      const mockPlan: LearningPlan = {
        id: 'plan-1',
        daysCount: 90,
        wordsPerDay: 15,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: mockCreatePlan,
        updatePlan: mockUpdatePlan,
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: mockClearError,
      });
      
      render(<PlanSetupPage />);
      
      expect(screen.getByText('当前学习计划')).toBeInTheDocument();
      expect(screen.getByText(/90/)).toBeInTheDocument();
      expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('should load current plan on mount', () => {
      render(<PlanSetupPage />);
      
      expect(mockLoadCurrentPlan).toHaveBeenCalled();
    });
  });

  describe('Requirement 2.1: 允许User修改现有的Learning_Plan', () => {
    it('should call updatePlan when updating existing plan', async () => {
      const user = userEvent.setup();
      const mockPlan: LearningPlan = {
        id: 'plan-1',
        daysCount: 90,
        wordsPerDay: 15,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: mockCreatePlan,
        updatePlan: mockUpdatePlan,
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: mockClearError,
      });

      mockUpdatePlan.mockResolvedValue(undefined);
      
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      const submitButton = screen.getByRole('button', { name: /更新学习计划/ });
      
      await user.clear(daysInput);
      await user.type(daysInput, '120');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdatePlan).toHaveBeenCalledWith('plan-1', {
          daysCount: 120,
          wordsPerDay: 15,
        });
      });
    });

    it('should show update button text when plan exists', () => {
      const mockPlan: LearningPlan = {
        id: 'plan-1',
        daysCount: 90,
        wordsPerDay: 15,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: mockPlan,
        loading: false,
        error: null,
        createPlan: mockCreatePlan,
        updatePlan: mockUpdatePlan,
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: mockClearError,
      });
      
      render(<PlanSetupPage />);
      
      expect(screen.getByRole('button', { name: /更新学习计划/ })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when store has error', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: null,
        loading: false,
        error: '创建学习计划失败',
        createPlan: mockCreatePlan,
        updatePlan: mockUpdatePlan,
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: mockClearError,
      });
      
      render(<PlanSetupPage />);
      
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('创建学习计划失败')).toBeInTheDocument();
    });

    it('should disable submit button when there are validation errors', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      const submitButton = screen.getByRole('button', { name: /创建学习计划/ });
      
      await user.clear(daysInput);
      await user.type(daysInput, '500');
      await user.tab();
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should disable submit button when loading', () => {
      (useLearningPlanStore as any).mockReturnValue({
        currentPlan: null,
        loading: true,
        error: null,
        createPlan: mockCreatePlan,
        updatePlan: mockUpdatePlan,
        loadCurrentPlan: mockLoadCurrentPlan,
        clearError: mockClearError,
      });
      
      render(<PlanSetupPage />);
      
      const submitButton = screen.getByRole('button', { name: /保存中/ });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should not submit form with invalid data', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      const submitButton = screen.getByRole('button', { name: /创建学习计划/ });
      
      await user.clear(daysInput);
      await user.type(daysInput, '0');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreatePlan).not.toHaveBeenCalled();
      });
    });

    it('should show validation errors on submit attempt', async () => {
      const user = userEvent.setup();
      render(<PlanSetupPage />);
      
      const daysInput = screen.getByLabelText('学习天数');
      const submitButton = screen.getByRole('button', { name: /创建学习计划/ });
      
      await user.clear(daysInput);
      await user.type(daysInput, '400');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('学习天数必须在1到365之间')).toBeInTheDocument();
      });
    });
  });
});

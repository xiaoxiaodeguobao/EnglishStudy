/**
 * ErrorMessage Component Tests
 * 
 * Tests for the ErrorMessage component covering all requirements.
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';
import type { ErrorType } from '../types/error';

describe('ErrorMessage Component', () => {
  describe('Basic Rendering', () => {
    it('should display error message', () => {
      // Requirement 12.1: Display friendly error messages
      render(<ErrorMessage message="测试错误消息" />);
      
      expect(screen.getByText('测试错误消息')).toBeInTheDocument();
    });

    it('should display error icon', () => {
      render(<ErrorMessage message="测试错误" />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<ErrorMessage message="测试错误" />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Types', () => {
    const errorTypes: Array<{ type: ErrorType; expectedTitle: string }> = [
      { type: 'network', expectedTitle: '网络错误' },
      { type: 'validation', expectedTitle: '输入错误' },
      { type: 'storage', expectedTitle: '存储错误' },
      { type: 'generation', expectedTitle: '生成错误' },
      { type: 'data_integrity', expectedTitle: '数据错误' },
    ];

    errorTypes.forEach(({ type, expectedTitle }) => {
      it(`should display correct title for ${type} error`, () => {
        // Requirement 12.1: Display friendly error messages for different error types
        render(<ErrorMessage message="错误详情" errorType={type} />);
        
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
      });
    });

    it('should display default title when error type is not provided', () => {
      render(<ErrorMessage message="错误详情" />);
      
      expect(screen.getByText('发生错误')).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should display retry button when onRetry is provided', () => {
      // Requirement 12.2: Provide retry button
      const onRetry = vi.fn();
      render(<ErrorMessage message="测试错误" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /重试/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      // Requirement 12.2: Provide retry button functionality
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<ErrorMessage message="测试错误" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /重试/i });
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not display retry button when onRetry is not provided', () => {
      render(<ErrorMessage message="测试错误" />);
      
      const retryButton = screen.queryByRole('button', { name: /重试/i });
      expect(retryButton).not.toBeInTheDocument();
    });

    it('should not display retry button when showRetry is false', () => {
      const onRetry = vi.fn();
      render(<ErrorMessage message="测试错误" onRetry={onRetry} showRetry={false} />);
      
      const retryButton = screen.queryByRole('button', { name: /重试/i });
      expect(retryButton).not.toBeInTheDocument();
    });

    it('should have proper accessibility label on retry button', () => {
      const onRetry = vi.fn();
      render(<ErrorMessage message="测试错误" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: '重试操作' });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Additional Details', () => {
    it('should display additional details when provided', () => {
      // Requirement 12.1: Display friendly error messages with details
      render(
        <ErrorMessage
          message="主要错误消息"
          details="这是额外的错误详情和建议"
        />
      );
      
      expect(screen.getByText('主要错误消息')).toBeInTheDocument();
      expect(screen.getByText('这是额外的错误详情和建议')).toBeInTheDocument();
    });

    it('should not display details section when details are not provided', () => {
      const { container } = render(<ErrorMessage message="测试错误" />);
      
      const detailsElements = container.querySelectorAll('.text-sm.text-red-700');
      expect(detailsElements.length).toBe(0);
    });
  });

  describe('Real-world Error Scenarios', () => {
    it('should handle network error with retry', async () => {
      // Requirement 12.3: Handle network errors with retry
      const user = userEvent.setup();
      const onRetry = vi.fn();
      
      render(
        <ErrorMessage
          message="无法获取单词解释"
          errorType="network"
          details="网络连接出现问题,请检查您的网络设置。"
          onRetry={onRetry}
        />
      );
      
      expect(screen.getByText('网络错误')).toBeInTheDocument();
      expect(screen.getByText('无法获取单词解释')).toBeInTheDocument();
      expect(screen.getByText('网络连接出现问题,请检查您的网络设置。')).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: /重试/i });
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalled();
    });

    it('should handle validation error without retry', () => {
      // Requirement 12.1: Display validation errors
      render(
        <ErrorMessage
          message="请输入1到365之间的数字"
          errorType="validation"
          showRetry={false}
        />
      );
      
      expect(screen.getByText('输入错误')).toBeInTheDocument();
      expect(screen.getByText('请输入1到365之间的数字')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /重试/i })).not.toBeInTheDocument();
    });

    it('should handle storage error with retry', () => {
      // Requirement 12.4: Handle storage errors with retry
      const onRetry = vi.fn();
      
      render(
        <ErrorMessage
          message="无法保存学习计划"
          errorType="storage"
          details="您的浏览器存储空间已满。请清理一些旧数据或导出数据后重试。"
          onRetry={onRetry}
        />
      );
      
      expect(screen.getByText('存储错误')).toBeInTheDocument();
      expect(screen.getByText('无法保存学习计划')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument();
    });

    it('should handle generation error with retry', () => {
      // Requirement 12.3: Handle generation errors with retry
      const onRetry = vi.fn();
      
      render(
        <ErrorMessage
          message="系统无法生成今天的单词列表"
          errorType="generation"
          onRetry={onRetry}
        />
      );
      
      expect(screen.getByText('生成错误')).toBeInTheDocument();
      expect(screen.getByText('系统无法生成今天的单词列表')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument();
    });

    it('should handle data integrity error', () => {
      render(
        <ErrorMessage
          message="检测到数据完整性问题"
          errorType="data_integrity"
          details="学习计划数据与进度数据不一致。"
        />
      );
      
      expect(screen.getByText('数据错误')).toBeInTheDocument();
      expect(screen.getByText('检测到数据完整性问题')).toBeInTheDocument();
      expect(screen.getByText('学习计划数据与进度数据不一致。')).toBeInTheDocument();
    });
  });

  describe('Styling and Responsiveness', () => {
    it('should apply responsive padding classes', () => {
      const { container } = render(<ErrorMessage message="测试错误" />);
      
      const errorDiv = container.querySelector('.sm\\:p-6');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should have proper color scheme for error state', () => {
      const { container } = render(<ErrorMessage message="测试错误" />);
      
      const errorDiv = container.querySelector('.bg-red-50.border-red-200');
      expect(errorDiv).toBeInTheDocument();
    });
  });

  describe('Multiple Retry Clicks', () => {
    it('should handle multiple retry button clicks', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      
      render(<ErrorMessage message="测试错误" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /重试/i });
      
      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(3);
    });
  });
});

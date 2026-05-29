/**
 * ContextFilter Component Tests
 * 
 * Tests for the ContextFilter component including:
 * - Rendering with various context selections
 * - Toggle functionality
 * - Select all and clear all functionality
 * - Accessibility attributes
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextFilter } from './ContextFilter';
import { ApplicationContext } from '../types/context';

describe('ContextFilter', () => {
  const allContexts: ApplicationContext[] = [
    'daily-conversation',
    'business-communication',
    'academic-writing',
    'technical-documentation',
    'literary-expression',
  ];

  it('should render all available contexts', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    // Check that all context labels are rendered
    expect(screen.getByText('日常对话')).toBeInTheDocument();
    expect(screen.getByText('商务交流')).toBeInTheDocument();
    expect(screen.getByText('学术写作')).toBeInTheDocument();
    expect(screen.getByText('技术文档')).toBeInTheDocument();
    expect(screen.getByText('文学表达')).toBeInTheDocument();
  });

  it('should render header with "Select All" and "Clear All" buttons', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('筛选场景')).toBeInTheDocument();
    expect(screen.getByText('全选')).toBeInTheDocument();
    expect(screen.getByText('清除')).toBeInTheDocument();
  });

  it('should highlight selected contexts', () => {
    const onSelectionChange = vi.fn();
    const selectedContexts: ApplicationContext[] = ['daily-conversation', 'business-communication'];
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={onSelectionChange}
      />
    );

    // Check aria-pressed attribute for selected contexts
    const dailyButton = screen.getByRole('button', { name: /日常对话/ });
    const businessButton = screen.getByRole('button', { name: /商务交流/ });
    const academicButton = screen.getByRole('button', { name: /学术写作/ });

    expect(dailyButton).toHaveAttribute('aria-pressed', 'true');
    expect(businessButton).toHaveAttribute('aria-pressed', 'true');
    expect(academicButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show selection count when contexts are selected', () => {
    const onSelectionChange = vi.fn();
    const selectedContexts: ApplicationContext[] = ['daily-conversation', 'business-communication'];
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByText('已选择 2 个场景')).toBeInTheDocument();
  });

  it('should not show selection count when no contexts are selected', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.queryByText(/已选择/)).not.toBeInTheDocument();
  });

  it('should call onSelectionChange when a context is toggled on', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const dailyButton = screen.getByRole('button', { name: /选择 日常对话/ });
    await user.click(dailyButton);

    expect(onSelectionChange).toHaveBeenCalledWith(['daily-conversation']);
  });

  it('should call onSelectionChange when a context is toggled off', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const selectedContexts: ApplicationContext[] = ['daily-conversation', 'business-communication'];
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={onSelectionChange}
      />
    );

    const dailyButton = screen.getByRole('button', { name: /取消选择 日常对话/ });
    await user.click(dailyButton);

    expect(onSelectionChange).toHaveBeenCalledWith(['business-communication']);
  });

  it('should select all contexts when "Select All" is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const selectAllButton = screen.getByRole('button', { name: '选择所有场景' });
    await user.click(selectAllButton);

    expect(onSelectionChange).toHaveBeenCalledWith(allContexts);
  });

  it('should clear all contexts when "Clear All" is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    const selectedContexts: ApplicationContext[] = ['daily-conversation', 'business-communication'];
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={onSelectionChange}
      />
    );

    const clearAllButton = screen.getByRole('button', { name: '清除所有场景' });
    await user.click(clearAllButton);

    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('should apply custom className', () => {
    const onSelectionChange = vi.fn();
    
    const { container } = render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
        className="custom-class"
      />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('custom-class');
  });

  it('should handle empty contexts array', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={[]}
        selectedContexts={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    // Should still render header
    expect(screen.getByText('筛选场景')).toBeInTheDocument();
    
    // But no context buttons
    expect(screen.queryByText('日常对话')).not.toBeInTheDocument();
  });

  it('should handle subset of contexts', () => {
    const onSelectionChange = vi.fn();
    const subsetContexts: ApplicationContext[] = ['daily-conversation', 'business-communication'];
    
    render(
      <ContextFilter
        contexts={subsetContexts}
        selectedContexts={['daily-conversation']}
        onSelectionChange={onSelectionChange}
      />
    );

    // Should render only the subset
    expect(screen.getByText('日常对话')).toBeInTheDocument();
    expect(screen.getByText('商务交流')).toBeInTheDocument();
    expect(screen.queryByText('学术写作')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const onSelectionChange = vi.fn();
    
    render(
      <ContextFilter
        contexts={allContexts}
        selectedContexts={['daily-conversation']}
        onSelectionChange={onSelectionChange}
      />
    );

    // Check that buttons have proper aria-label and aria-pressed
    const dailyButton = screen.getByRole('button', { name: /取消选择 日常对话/ });
    expect(dailyButton).toHaveAttribute('aria-pressed', 'true');
    
    const businessButton = screen.getByRole('button', { name: /选择 商务交流/ });
    expect(businessButton).toHaveAttribute('aria-pressed', 'false');
  });
});

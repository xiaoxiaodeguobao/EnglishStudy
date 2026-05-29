/**
 * WordDefinition Component Tests
 * 
 * Tests for the WordDefinition component
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordDefinition } from './WordDefinition';
import { WordDefinition as WordDefinitionType } from '../types/word';

describe('WordDefinition', () => {
  it('should render a single definition with all fields', () => {
    // Requirement 6.1, 6.2, 6.3
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'noun',
        meaningCN: '书；书籍',
        meaningEN: 'a written or printed work consisting of pages',
      },
    ];

    render(<WordDefinition definitions={definitions} />);

    // Check part of speech is displayed
    expect(screen.getByText('noun')).toBeInTheDocument();
    
    // Check Chinese meaning is displayed
    expect(screen.getByText('书；书籍')).toBeInTheDocument();
    
    // Check English meaning is displayed
    expect(screen.getByText('a written or printed work consisting of pages')).toBeInTheDocument();
  });

  it('should render multiple definitions for different parts of speech', () => {
    // Requirement 6.4
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'noun',
        meaningCN: '书；书籍',
        meaningEN: 'a written or printed work consisting of pages',
      },
      {
        partOfSpeech: 'verb',
        meaningCN: '预订；预约',
        meaningEN: 'to arrange for someone to have a seat on a plane',
      },
    ];

    render(<WordDefinition definitions={definitions} />);

    // Check both parts of speech are displayed
    expect(screen.getByText('noun')).toBeInTheDocument();
    expect(screen.getByText('verb')).toBeInTheDocument();
    
    // Check both Chinese meanings are displayed
    expect(screen.getByText('书；书籍')).toBeInTheDocument();
    expect(screen.getByText('预订；预约')).toBeInTheDocument();
    
    // Check both English meanings are displayed
    expect(screen.getByText('a written or printed work consisting of pages')).toBeInTheDocument();
    expect(screen.getByText('to arrange for someone to have a seat on a plane')).toBeInTheDocument();
  });

  it('should display structured format with visual separation', () => {
    // Requirement 6.5
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'adjective',
        meaningCN: '快速的；迅速的',
        meaningEN: 'moving or capable of moving at high speed',
      },
    ];

    const { container } = render(<WordDefinition definitions={definitions} />);

    // Check that the definition has border styling for visual structure
    const definitionElement = container.querySelector('.border-l-4');
    expect(definitionElement).toBeInTheDocument();
    
    // Check that part of speech has badge styling
    const posElement = container.querySelector('.bg-blue-100');
    expect(posElement).toBeInTheDocument();
  });

  it('should handle empty definitions array gracefully', () => {
    render(<WordDefinition definitions={[]} />);

    // Should display a message when no definitions are available
    expect(screen.getByText('暂无释义')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'noun',
        meaningCN: '测试',
        meaningEN: 'test',
      },
    ];

    const { container } = render(
      <WordDefinition definitions={definitions} className="custom-class" />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.className).toContain('custom-class');
  });

  it('should render definitions with proper semantic structure', () => {
    // Requirement 6.5 - structured format
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'noun',
        meaningCN: '例子',
        meaningEN: 'example',
      },
      {
        partOfSpeech: 'verb',
        meaningCN: '举例说明',
        meaningEN: 'to illustrate by example',
      },
    ];

    const { container } = render(<WordDefinition definitions={definitions} />);

    // Check that multiple definitions are rendered
    const definitionElements = container.querySelectorAll('.border-l-4');
    expect(definitionElements).toHaveLength(2);
  });

  it('should handle special characters in meanings', () => {
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'noun',
        meaningCN: '符号：@、#、$',
        meaningEN: 'symbols: @, #, $',
      },
    ];

    render(<WordDefinition definitions={definitions} />);

    expect(screen.getByText('符号：@、#、$')).toBeInTheDocument();
    expect(screen.getByText('symbols: @, #, $')).toBeInTheDocument();
  });

  it('should handle long definitions without breaking layout', () => {
    const definitions: WordDefinitionType[] = [
      {
        partOfSpeech: 'noun',
        meaningCN: '这是一个非常长的中文释义，用来测试组件是否能够正确处理长文本内容而不会破坏布局结构',
        meaningEN: 'This is a very long English definition to test whether the component can properly handle long text content without breaking the layout structure',
      },
    ];

    render(<WordDefinition definitions={definitions} />);

    expect(screen.getByText(/这是一个非常长的中文释义/)).toBeInTheDocument();
    expect(screen.getByText(/This is a very long English definition/)).toBeInTheDocument();
  });
});

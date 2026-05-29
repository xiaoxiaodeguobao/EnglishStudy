/**
 * WordList Component Tests
 * 
 * Tests for the WordList component including loading, empty, and populated states.
 * Requirements: 3.2, 11.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordList } from './WordList';
import type { Word } from '../types/word';

// Mock WordCard component to simplify testing
vi.mock('./WordCard', () => ({
  WordCard: ({ word }: { word: Word }) => (
    <div data-testid={`word-card-${word.id}`}>
      <h2>{word.word}</h2>
    </div>
  ),
}));

describe('WordList', () => {
  const mockWords: Word[] = [
    {
      id: '1',
      word: 'hello',
      phonetic: '/həˈloʊ/',
      definitions: [
        {
          partOfSpeech: 'interjection',
          meaningCN: '你好',
          meaningEN: 'used as a greeting',
        },
      ],
      examples: [
        {
          sentence: 'Hello, how are you?',
          translation: '你好，你好吗？',
          highlightWord: 'hello',
        },
      ],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      word: 'world',
      phonetic: '/wɜːrld/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '世界',
          meaningEN: 'the earth and all its inhabitants',
        },
      ],
      examples: [
        {
          sentence: 'The world is a beautiful place.',
          translation: '世界是一个美丽的地方。',
          highlightWord: 'world',
        },
      ],
      associations: ['1'],
      generatedAt: new Date('2024-01-01'),
    },
  ];

  describe('Loading State', () => {
    it('should display loading indicator when loading is true', () => {
      render(<WordList words={[]} loading={true} />);

      expect(screen.getByText('加载单词中...')).toBeInTheDocument();
    });

    it('should display spinner icon when loading', () => {
      const { container } = render(<WordList words={[]} loading={true} />);

      // Check for the Loader2 icon (it has animate-spin class)
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not display words when loading', () => {
      render(<WordList words={mockWords} loading={true} />);

      expect(screen.queryByTestId('word-card-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('word-card-2')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when words array is empty', () => {
      render(<WordList words={[]} loading={false} />);

      expect(screen.getByText('暂无单词')).toBeInTheDocument();
      expect(
        screen.getByText(/当前没有可显示的单词/)
      ).toBeInTheDocument();
    });

    it('should display empty state when words is undefined', () => {
      render(<WordList words={undefined as any} loading={false} />);

      expect(screen.getByText('暂无单词')).toBeInTheDocument();
    });

    it('should display book icon in empty state', () => {
      const { container } = render(<WordList words={[]} loading={false} />);

      // Check for the SVG icon
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Word List Display', () => {
    it('should render all words when provided', () => {
      render(<WordList words={mockWords} loading={false} />);

      expect(screen.getByTestId('word-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('word-card-2')).toBeInTheDocument();
    });

    it('should render words with correct content', () => {
      render(<WordList words={mockWords} loading={false} />);

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('world')).toBeInTheDocument();
    });

    it('should render single word correctly', () => {
      const singleWord = [mockWords[0]];
      render(<WordList words={singleWord} loading={false} />);

      expect(screen.getByTestId('word-card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('word-card-2')).not.toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(
        <WordList words={mockWords} loading={false} className="custom-class" />
      );

      const wordListContainer = container.firstChild;
      expect(wordListContainer).toHaveClass('custom-class');
    });
  });

  describe('State Transitions', () => {
    it('should transition from loading to displaying words', () => {
      const { rerender } = render(<WordList words={[]} loading={true} />);

      expect(screen.getByText('加载单词中...')).toBeInTheDocument();

      rerender(<WordList words={mockWords} loading={false} />);

      expect(screen.queryByText('加载单词中...')).not.toBeInTheDocument();
      expect(screen.getByTestId('word-card-1')).toBeInTheDocument();
    });

    it('should transition from loading to empty state', () => {
      const { rerender } = render(<WordList words={[]} loading={true} />);

      expect(screen.getByText('加载单词中...')).toBeInTheDocument();

      rerender(<WordList words={[]} loading={false} />);

      expect(screen.queryByText('加载单词中...')).not.toBeInTheDocument();
      expect(screen.getByText('暂无单词')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-hidden attributes on decorative icons', () => {
      const { container } = render(<WordList words={[]} loading={true} />);

      const spinner = container.querySelector('[aria-hidden="true"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should have semantic structure in empty state', () => {
      render(<WordList words={[]} loading={false} />);

      const heading = screen.getByRole('heading', { name: '暂无单词' });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive spacing classes', () => {
      const { container } = render(<WordList words={mockWords} loading={false} />);

      const wordListContainer = container.firstChild;
      expect(wordListContainer).toHaveClass('space-y-6');
    });
  });

  describe('Virtual Scrolling Performance Optimization', () => {
    // Generate a large list of words for testing virtual scrolling
    const generateMockWords = (count: number): Word[] => {
      return Array.from({ length: count }, (_, index) => ({
        id: `word-${index + 1}`,
        word: `word${index + 1}`,
        phonetic: `/wɜːrd${index + 1}/`,
        definitions: [
          {
            partOfSpeech: 'noun',
            meaningCN: `单词${index + 1}`,
            meaningEN: `word number ${index + 1}`,
          },
        ],
        examples: [
          {
            sentence: `This is an example sentence for word${index + 1}.`,
            translation: `这是单词${index + 1}的例句。`,
            highlightWord: `word${index + 1}`,
          },
        ],
        associations: [],
        generatedAt: new Date('2024-01-01'),
      }));
    };

    it('should use regular rendering for small lists (≤50 words)', () => {
      const smallList = generateMockWords(50);
      const { container } = render(<WordList words={smallList} loading={false} />);

      // Regular rendering uses space-y-6 class
      const wordListContainer = container.firstChild;
      expect(wordListContainer).toHaveClass('space-y-6');
      
      // Should not have virtual scrolling container styles
      expect(wordListContainer).not.toHaveStyle({ height: '100vh' });
    });

    it('should use virtual scrolling for large lists (>50 words)', () => {
      const largeList = generateMockWords(51);
      const { container } = render(<WordList words={largeList} loading={false} />);

      // Virtual scrolling uses overflow-auto class
      const wordListContainer = container.firstChild;
      expect(wordListContainer).toHaveClass('overflow-auto');
    });

    it('should handle typical daily word count (10-50 words) with regular rendering', () => {
      // Test with 10 words (minimum typical case)
      const tenWords = generateMockWords(10);
      const { container: container10 } = render(<WordList words={tenWords} loading={false} />);
      expect(container10.firstChild).toHaveClass('space-y-6');

      // Test with 30 words (average case)
      const thirtyWords = generateMockWords(30);
      const { container: container30 } = render(<WordList words={thirtyWords} loading={false} />);
      expect(container30.firstChild).toHaveClass('space-y-6');

      // Test with 50 words (maximum before virtual scrolling)
      const fiftyWords = generateMockWords(50);
      const { container: container50 } = render(<WordList words={fiftyWords} loading={false} />);
      expect(container50.firstChild).toHaveClass('space-y-6');
    });

    it('should handle maximum daily word count (100 words) with virtual scrolling', () => {
      const hundredWords = generateMockWords(100);
      const { container } = render(<WordList words={hundredWords} loading={false} />);

      // Should use virtual scrolling for 100 words
      const wordListContainer = container.firstChild;
      expect(wordListContainer).toHaveClass('overflow-auto');
    });

    it('should render all word cards in small lists', () => {
      const smallList = generateMockWords(10);
      render(<WordList words={smallList} loading={false} />);

      // All 10 word cards should be rendered
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByTestId(`word-card-word-${i}`)).toBeInTheDocument();
      }
    });

    it('should optimize rendering for very large lists (>100 words)', () => {
      const veryLargeList = generateMockWords(200);
      const { container } = render(<WordList words={veryLargeList} loading={false} />);

      // Should use virtual scrolling
      const wordListContainer = container.firstChild;
      expect(wordListContainer).toHaveClass('overflow-auto');
      
      // Virtual scrolling should not render all items at once
      // Only visible items + overscan should be in the DOM
      const renderedCards = container.querySelectorAll('[data-testid^="word-card-"]');
      expect(renderedCards.length).toBeLessThan(200);
    });

    it('should maintain correct threshold boundary (50 words)', () => {
      // Test exactly at threshold
      const atThreshold = generateMockWords(50);
      const { container: containerAt } = render(<WordList words={atThreshold} loading={false} />);
      expect(containerAt.firstChild).toHaveClass('space-y-6');
      expect(containerAt.firstChild).not.toHaveClass('overflow-auto');

      // Test just above threshold
      const aboveThreshold = generateMockWords(51);
      const { container: containerAbove } = render(<WordList words={aboveThreshold} loading={false} />);
      expect(containerAbove.firstChild).toHaveClass('overflow-auto');
      expect(containerAbove.firstChild).not.toHaveClass('space-y-6');
    });
  });
});

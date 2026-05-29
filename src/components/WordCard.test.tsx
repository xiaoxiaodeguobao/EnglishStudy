/**
 * WordCard Component Tests
 * 
 * Tests for the WordCard component including rendering, responsive layout,
 * and integration with WordDefinition and ExampleSentences components.
 * Updated to support enhanced examples with context filtering and quality indicators.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WordCard } from './WordCard';
import { Word } from '../types/word';
import * as useExampleSentencesModule from '../hooks/useExampleSentences';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component with QueryClientProvider
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('WordCard', () => {
  const mockWord: Word = {
    id: 'word-1',
    word: 'example',
    phonetic: '/ɪɡˈzæmpəl/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '例子；实例',
        meaningEN: 'a thing characteristic of its kind or illustrating a general rule',
      },
      {
        partOfSpeech: 'verb',
        meaningCN: '举例说明',
        meaningEN: 'to be illustrated or exemplified',
      },
    ],
    examples: [
      {
        sentence: 'This is a good example of modern architecture.',
        translation: '这是现代建筑的一个好例子。',
        highlightWord: 'example',
      },
      {
        sentence: 'Can you give me an example?',
        translation: '你能给我举个例子吗？',
        highlightWord: 'example',
      },
    ],
    associations: [],
    generatedAt: new Date('2024-01-01'),
  };

  // Mock enhanced examples with context
  const mockEnhancedExamples = [
    {
      sentence: 'This is a good example of modern architecture.',
      translation: '这是现代建筑的一个好例子。',
      highlightWord: 'example',
      context: 'daily-conversation' as const,
      diversityScore: 0.85,
      naturalnessScore: 0.90,
      metadata: {
        generatedAt: new Date('2024-01-01'),
        model: 'gpt-3.5-turbo',
        tokensUsed: 100,
      },
    },
    {
      sentence: 'Can you give me an example?',
      translation: '你能给我举个例子吗？',
      highlightWord: 'example',
      context: 'business-communication' as const,
      diversityScore: 0.75,
      naturalnessScore: 0.80,
      metadata: {
        generatedAt: new Date('2024-01-01'),
        model: 'gpt-3.5-turbo',
        tokensUsed: 80,
      },
    },
  ];

  // Mock the useExampleSentences hook
  const mockUseExampleSentences = (returnValue: any) => {
    vi.spyOn(useExampleSentencesModule, 'useExampleSentences').mockReturnValue(returnValue);
  };

  describe('Rendering', () => {
    it('should render the word', async () => {
      // Requirement 6.1
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      expect(screen.getByRole('heading', { name: 'example' })).toBeInTheDocument();
    });

    it('should render the phonetic notation', async () => {
      // Requirement 6.6
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      expect(screen.getByText('/ɪɡˈzæmpəl/')).toBeInTheDocument();
    });

    it('should render without phonetic notation when not provided', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const wordWithoutPhonetic: Word = {
        ...mockWord,
        phonetic: undefined,
      };
      render(<WordCard word={wordWithoutPhonetic} />, { wrapper });
      expect(screen.getByRole('heading', { name: 'example' })).toBeInTheDocument();
      expect(screen.queryByText(/\//)).not.toBeInTheDocument();
    });

    it('should render the definitions section header', async () => {
      // Requirement 6.1, 6.2, 6.3
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      expect(screen.getByText('释义')).toBeInTheDocument();
    });

    it('should render the example sentences section header', async () => {
      // Requirement 7.1, 7.4
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      expect(screen.getByText('例句')).toBeInTheDocument();
    });

    it('should render all definitions', async () => {
      // Requirement 6.2, 6.3
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      expect(screen.getByText('例子；实例')).toBeInTheDocument();
      expect(screen.getByText('举例说明')).toBeInTheDocument();
    });

    it('should render all example sentences', async () => {
      // Requirement 7.1, 7.4
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        const firstSentence = screen.getAllByText((content, element) => {
          return element?.textContent === 'This is a good example of modern architecture.';
        });
        expect(firstSentence.length).toBeGreaterThan(0);
      });
      
      const secondSentence = screen.getAllByText((content, element) => {
        return element?.textContent === 'Can you give me an example?';
      });
      expect(secondSentence.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('should integrate WordDefinition component', async () => {
      // Requirement 6.1, 6.2, 6.3
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      // Check that part of speech labels are rendered (from WordDefinition)
      expect(screen.getByText('noun')).toBeInTheDocument();
      expect(screen.getByText('verb')).toBeInTheDocument();
    });

    it('should integrate ExampleSentences component', async () => {
      // Requirement 7.1, 7.4
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        // Check that translations are rendered (from ExampleSentences)
        expect(screen.getByText('这是现代建筑的一个好例子。')).toBeInTheDocument();
        expect(screen.getByText('你能给我举个例子吗？')).toBeInTheDocument();
      });
    });
  });

  describe('Enhanced Features', () => {
    it('should show quality indicator toggle when enhanced examples are available', async () => {
      // Requirement 8.3
      mockUseExampleSentences({
        data: mockEnhancedExamples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('显示质量指标')).toBeInTheDocument();
      });
    });

    it('should toggle quality indicators when button is clicked', async () => {
      // Requirement 8.3
      mockUseExampleSentences({
        data: mockEnhancedExamples,
        isLoading: false,
        error: null,
      });
      
      const user = userEvent.setup();
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('显示质量指标')).toBeInTheDocument();
      });
      
      const toggleButton = screen.getByText('显示质量指标');
      await user.click(toggleButton);
      
      expect(screen.getByText('隐藏质量指标')).toBeInTheDocument();
    });

    it('should show context filter when multiple contexts are available', async () => {
      // Requirement 8.6
      mockUseExampleSentences({
        data: mockEnhancedExamples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('筛选场景')).toBeInTheDocument();
      });
    });

    it('should not show context filter when only one context is available', async () => {
      // Requirement 8.6
      const singleContextExamples = [mockEnhancedExamples[0]];
      mockUseExampleSentences({
        data: singleContextExamples,
        isLoading: false,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        expect(screen.queryByText('筛选场景')).not.toBeInTheDocument();
      });
    });

    it('should show loading state while fetching examples', async () => {
      mockUseExampleSentences({
        data: undefined,
        isLoading: true,
        error: null,
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      expect(screen.getByText('正在加载例句...')).toBeInTheDocument();
    });

    it('should show error state when fetching fails', async () => {
      mockUseExampleSentences({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        expect(screen.getByText('加载例句失败，显示基础例句')).toBeInTheDocument();
      });
    });

    it('should fallback to word.examples when enhanced examples fail to load', async () => {
      mockUseExampleSentences({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });
      
      render(<WordCard word={mockWord} />, { wrapper });
      
      await waitFor(() => {
        // Should still show the basic examples from word.examples
        expect(screen.getByText('这是现代建筑的一个好例子。')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should apply responsive classes for mobile and desktop', async () => {
      // Requirement 11.3
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const { container } = render(<WordCard word={mockWord} />, { wrapper });
      
      // Check for responsive padding classes
      const headerSection = container.querySelector('.p-6.sm\\:p-8');
      expect(headerSection).toBeInTheDocument();
      
      // Check for responsive flex classes
      const wordHeader = container.querySelector('.sm\\:flex-row');
      expect(wordHeader).toBeInTheDocument();
    });

    it('should apply custom className when provided', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const { container } = render(<WordCard word={mockWord} className="custom-class" />, { wrapper });
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle word with no definitions', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const wordWithNoDefinitions: Word = {
        ...mockWord,
        definitions: [],
      };
      render(<WordCard word={wordWithNoDefinitions} />, { wrapper });
      
      // Should still render the word
      expect(screen.getByRole('heading', { name: 'example' })).toBeInTheDocument();
      
      // Should show empty state message from WordDefinition
      expect(screen.getByText('暂无释义')).toBeInTheDocument();
    });

    it('should handle word with no examples', async () => {
      mockUseExampleSentences({
        data: [],
        isLoading: false,
        error: null,
      });
      
      const wordWithNoExamples: Word = {
        ...mockWord,
        examples: [],
      };
      render(<WordCard word={wordWithNoExamples} />, { wrapper });
      
      // Should still render the word
      expect(screen.getByRole('heading', { name: 'example' })).toBeInTheDocument();
      
      await waitFor(() => {
        // Should show empty state message from ExampleSentences
        expect(screen.getByText('暂无例句')).toBeInTheDocument();
      });
    });

    it('should handle word with single definition', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const wordWithSingleDefinition: Word = {
        ...mockWord,
        definitions: [mockWord.definitions[0]],
      };
      render(<WordCard word={wordWithSingleDefinition} />, { wrapper });
      
      expect(screen.getByText('例子；实例')).toBeInTheDocument();
      expect(screen.queryByText('举例说明')).not.toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should have a card-like appearance with shadow', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const { container } = render(<WordCard word={mockWord} />, { wrapper });
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('bg-white');
      expect(card.className).toContain('rounded-lg');
      expect(card.className).toContain('shadow-md');
    });

    it('should have a colored header section', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const { container } = render(<WordCard word={mockWord} />, { wrapper });
      const header = container.querySelector('.bg-gradient-to-r');
      
      expect(header).toBeInTheDocument();
      expect(header?.className).toContain('from-blue-500');
      expect(header?.className).toContain('to-blue-600');
    });

    it('should have section dividers with visual indicators', async () => {
      mockUseExampleSentences({
        data: mockWord.examples,
        isLoading: false,
        error: null,
      });
      
      const { container } = render(<WordCard word={mockWord} />, { wrapper });
      
      // Check for the blue bar indicators before section headers
      const indicators = container.querySelectorAll('.bg-blue-500');
      expect(indicators.length).toBeGreaterThan(0);
    });
  });
});

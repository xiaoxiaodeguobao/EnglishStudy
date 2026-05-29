/**
 * SentenceChainSection Component Tests
 * 
 * Tests for the SentenceChainSection component including:
 * - Rendering sentence chains with highlighted words
 * - Displaying Chinese translations
 * - Handling empty states
 * - Word highlighting functionality
 * Requirements: 5.1, 5.2, 5.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentenceChainSection } from './SentenceChainSection';
import { SentenceChain } from '../types/wordList';
import { Word } from '../types/word';
import { EnhancedSentenceChain } from '../services/enhanced/types';

describe('SentenceChainSection', () => {
  // Mock data
  const mockWords: Word[] = [
    {
      id: 'word-1',
      word: 'apple',
      phonetic: '/ˈæpəl/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '苹果',
          meaningEN: 'a round fruit with red or green skin',
        },
      ],
      examples: [],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    },
    {
      id: 'word-2',
      word: 'tree',
      phonetic: '/triː/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '树',
          meaningEN: 'a tall plant with a wooden trunk',
        },
      ],
      examples: [],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    },
    {
      id: 'word-3',
      word: 'garden',
      phonetic: '/ˈɡɑːrdən/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '花园',
          meaningEN: 'a piece of ground for growing plants',
        },
      ],
      examples: [],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    },
  ];

  const mockSentenceChains: SentenceChain[] = [
    {
      id: 'chain-1',
      sentence: 'The apple tree in my garden is very tall.',
      usedWordIds: ['word-1', 'word-2', 'word-3'],
      translation: '我花园里的苹果树非常高。',
    },
    {
      id: 'chain-2',
      sentence: 'I picked an apple from the tree.',
      usedWordIds: ['word-1', 'word-2'],
      translation: '我从树上摘了一个苹果。',
    },
    {
      id: 'chain-3',
      sentence: 'The garden has many apple trees.',
      usedWordIds: ['word-1', 'word-2', 'word-3'],
      translation: '花园里有很多苹果树。',
    },
  ];

  describe('Rendering', () => {
    it('should render sentence chains correctly', () => {
      // Requirement 5.1
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check section header
      expect(screen.getByText('连锁造句')).toBeInTheDocument();
      expect(screen.getByText('使用今日单词构成的句子示例')).toBeInTheDocument();

      // Check all sentences are rendered (using getAllByText and checking the p element specifically)
      const sentences = screen.getAllByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent === 'The apple tree in my garden is very tall.';
      });
      expect(sentences.length).toBeGreaterThan(0);
      
      const sentence2 = screen.getAllByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent === 'I picked an apple from the tree.';
      });
      expect(sentence2.length).toBeGreaterThan(0);
      
      const sentence3 = screen.getAllByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent === 'The garden has many apple trees.';
      });
      expect(sentence3.length).toBeGreaterThan(0);
    });

    it('should display at least 3 sentence chains when available', () => {
      // Requirement 5.2
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check that we have at least 3 chains
      const chainElements = screen.getAllByText(/使用了 \d+ 个单词/);
      expect(chainElements.length).toBeGreaterThanOrEqual(3);
    });

    it('should display Chinese translations', () => {
      // Requirement 5.3
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check translations are present
      expect(screen.getByText('我花园里的苹果树非常高。')).toBeInTheDocument();
      expect(screen.getByText('我从树上摘了一个苹果。')).toBeInTheDocument();
      expect(screen.getByText('花园里有很多苹果树。')).toBeInTheDocument();
    });

    it('should display chain numbers', () => {
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check numbered badges
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display word count for each chain', () => {
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check word counts (using getAllByText and filtering for span elements)
      const threeWordChains = screen.getAllByText((content, element) => {
        return element?.tagName === 'SPAN' && element?.textContent === '使用了 3 个单词';
      });
      expect(threeWordChains.length).toBe(2); // Two chains use 3 words
      
      const twoWordChains = screen.getAllByText((content, element) => {
        return element?.tagName === 'SPAN' && element?.textContent === '使用了 2 个单词';
      });
      expect(twoWordChains.length).toBe(1);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
          className="custom-class"
        />
      );

      const element = container.firstChild as HTMLElement;
      expect(element.className).toContain('custom-class');
    });
  });

  describe('Word Highlighting', () => {
    it('should highlight words used in the sentence', () => {
      // Requirement 5.3
      const { container } = render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check that words are highlighted (using mark tags)
      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
    });

    it('should highlight words case-insensitively', () => {
      const chainWithMixedCase: SentenceChain[] = [
        {
          id: 'chain-mixed',
          sentence: 'Apple trees grow in the Garden.',
          usedWordIds: ['word-1', 'word-2', 'word-3'],
          translation: '苹果树在花园里生长。',
        },
      ];

      const { container } = render(
        <SentenceChainSection
          sentenceChains={chainWithMixedCase}
          words={mockWords}
        />
      );

      // Check that capitalized words are still highlighted
      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
    });

    it('should handle multiple occurrences of the same word', () => {
      const chainWithRepeats: SentenceChain[] = [
        {
          id: 'chain-repeat',
          sentence: 'The apple is red and the apple is sweet.',
          usedWordIds: ['word-1'],
          translation: '这个苹果是红色的，这个苹果是甜的。',
        },
      ];

      const { container } = render(
        <SentenceChainSection
          sentenceChains={chainWithRepeats}
          words={mockWords}
        />
      );

      // Both occurrences should be highlighted
      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThanOrEqual(2);
    });

    it('should not highlight partial word matches', () => {
      const chainWithPartial: SentenceChain[] = [
        {
          id: 'chain-partial',
          sentence: 'The pineapple is not an apple.',
          usedWordIds: ['word-1'],
          translation: '菠萝不是苹果。',
        },
      ];

      const { container } = render(
        <SentenceChainSection
          sentenceChains={chainWithPartial}
          words={mockWords}
        />
      );

      // Only "apple" should be highlighted, not "pineapple"
      const marks = container.querySelectorAll('mark');
      const highlightedText = Array.from(marks).map(mark => mark.textContent);
      
      // Should highlight "apple" but not include "pineapple"
      expect(highlightedText.some(text => text?.toLowerCase() === 'apple')).toBe(true);
      expect(highlightedText.some(text => text?.toLowerCase() === 'pineapple')).toBe(false);
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no sentence chains provided', () => {
      render(
        <SentenceChainSection
          sentenceChains={[]}
          words={mockWords}
        />
      );

      expect(screen.getByText('暂无句子链')).toBeInTheDocument();
    });

    it('should display empty state when sentenceChains is undefined', () => {
      render(
        <SentenceChainSection
          sentenceChains={undefined as any}
          words={mockWords}
        />
      );

      expect(screen.getByText('暂无句子链')).toBeInTheDocument();
    });

    it('should display empty state icon', () => {
      const { container } = render(
        <SentenceChainSection
          sentenceChains={[]}
          words={mockWords}
        />
      );

      // Check for SVG icon
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty words array', () => {
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={[]}
        />
      );

      // Should still render sentences, just without highlighting
      expect(screen.getByText(/The apple tree in my garden is very tall/)).toBeInTheDocument();
    });

    it('should handle sentence chains with no usedWordIds', () => {
      const chainWithNoWords: SentenceChain[] = [
        {
          id: 'chain-empty',
          sentence: 'This is a sentence.',
          usedWordIds: [],
          translation: '这是一个句子。',
        },
      ];

      render(
        <SentenceChainSection
          sentenceChains={chainWithNoWords}
          words={mockWords}
        />
      );

      expect(screen.getByText('This is a sentence.')).toBeInTheDocument();
      expect(screen.getByText('使用了 0 个单词')).toBeInTheDocument();
    });

    it('should handle sentence chains with invalid word IDs', () => {
      const chainWithInvalidIds: SentenceChain[] = [
        {
          id: 'chain-invalid',
          sentence: 'This is a test sentence.',
          usedWordIds: ['invalid-id-1', 'invalid-id-2'],
          translation: '这是一个测试句子。',
        },
      ];

      render(
        <SentenceChainSection
          sentenceChains={chainWithInvalidIds}
          words={mockWords}
        />
      );

      // Should render without errors
      expect(screen.getByText('This is a test sentence.')).toBeInTheDocument();
    });

    it('should handle special characters in words', () => {
      const specialWords: Word[] = [
        {
          id: 'word-special',
          word: 'can\'t',
          phonetic: '/kænt/',
          definitions: [
            {
              partOfSpeech: 'verb',
              meaningCN: '不能',
              meaningEN: 'cannot',
            },
          ],
          examples: [],
          associations: [],
          generatedAt: new Date('2024-01-01'),
        },
      ];

      const chainWithSpecial: SentenceChain[] = [
        {
          id: 'chain-special',
          sentence: 'I can\'t do this.',
          usedWordIds: ['word-special'],
          translation: '我不能做这个。',
        },
      ];

      render(
        <SentenceChainSection
          sentenceChains={chainWithSpecial}
          words={specialWords}
        />
      );

      // Should render without errors (using getAllByText and checking for p element)
      const sentences = screen.getAllByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent === 'I can\'t do this.';
      });
      expect(sentences.length).toBeGreaterThan(0);
    });
  });

  describe('Enhanced Sentence Chains', () => {
    const mockEnhancedChains: EnhancedSentenceChain[] = [
      {
        id: 'enhanced-1',
        sentence: 'The apple tree in my garden is very tall.',
        usedWordIds: ['word-1', 'word-2', 'word-3'],
        translation: '我花园里的苹果树非常高。',
        context: 'daily-conversation',
        qualityScore: 0.85,
        metadata: {
          generatedAt: new Date('2024-01-01'),
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
        },
      },
      {
        id: 'enhanced-2',
        sentence: 'I picked an apple from the tree.',
        usedWordIds: ['word-1', 'word-2'],
        translation: '我从树上摘了一个苹果。',
        context: 'business-communication',
        qualityScore: 0.78,
        metadata: {
          generatedAt: new Date('2024-01-01'),
          model: 'gpt-3.5-turbo',
          tokensUsed: 45,
        },
      },
      {
        id: 'enhanced-3',
        sentence: 'The garden has many apple trees.',
        usedWordIds: ['word-1', 'word-2', 'word-3'],
        translation: '花园里有很多苹果树。',
        context: 'academic-writing',
        qualityScore: 0.92,
        metadata: {
          generatedAt: new Date('2024-01-01'),
          model: 'gpt-3.5-turbo',
          tokensUsed: 48,
        },
      },
    ];

    it('should accept and render EnhancedSentenceChain array', () => {
      // Requirement 8.4
      render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
        />
      );

      // Check that sentences are rendered (using function matcher for highlighted text)
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent?.includes('The apple tree in my garden is very tall');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent?.includes('I picked an apple from the tree');
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent?.includes('The garden has many apple trees');
      })).toBeInTheDocument();
    });

    it('should display context labels by default', () => {
      // Requirement 8.4
      render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
        />
      );

      // Check that context labels are displayed
      expect(screen.getByText('日常对话')).toBeInTheDocument();
      expect(screen.getByText('商务交流')).toBeInTheDocument();
      expect(screen.getByText('学术写作')).toBeInTheDocument();
    });

    it('should hide context labels when showContextLabels is false', () => {
      // Requirement 8.4
      render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
          showContextLabels={false}
        />
      );

      // Check that context labels are not displayed
      expect(screen.queryByText('日常对话')).not.toBeInTheDocument();
      expect(screen.queryByText('商务交流')).not.toBeInTheDocument();
      expect(screen.queryByText('学术写作')).not.toBeInTheDocument();
    });

    it('should filter chains by context when filterContexts is provided', () => {
      // Requirement 8.6
      render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
          filterContexts={['daily-conversation', 'academic-writing']}
        />
      );

      // Check that only filtered contexts are displayed
      expect(screen.getByText('日常对话')).toBeInTheDocument();
      expect(screen.getByText('学术写作')).toBeInTheDocument();
      expect(screen.queryByText('商务交流')).not.toBeInTheDocument();

      // Check that only 2 chains are displayed
      const chainElements = screen.getAllByText(/使用了 \d+ 个单词/);
      expect(chainElements.length).toBe(2);
    });

    it('should display empty state when all chains are filtered out', () => {
      // Requirement 8.6
      render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
          filterContexts={['technical-documentation']}
        />
      );

      // Check that empty state is displayed
      expect(screen.getByText('暂无句子链')).toBeInTheDocument();
    });

    it('should handle mixed regular and enhanced chains', () => {
      const mixedChains = [
        ...mockSentenceChains.slice(0, 1),
        ...mockEnhancedChains.slice(0, 1),
      ];

      render(
        <SentenceChainSection
          sentenceChains={mixedChains}
          words={mockWords}
        />
      );

      // Check that both types are rendered (using getAllByText since there are duplicates)
      const sentences = screen.getAllByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent?.includes('The apple tree in my garden is very tall');
      });
      expect(sentences.length).toBe(2); // One regular, one enhanced
      
      // Only enhanced chain should have context label
      expect(screen.getByText('日常对话')).toBeInTheDocument();
    });

    it('should apply correct color classes to context labels', () => {
      const { container } = render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
        />
      );

      // Check that context labels have color classes
      const dailyLabel = screen.getByText('日常对话');
      expect(dailyLabel.className).toContain('bg-blue-100');
      expect(dailyLabel.className).toContain('text-blue-800');

      const businessLabel = screen.getByText('商务交流');
      expect(businessLabel.className).toContain('bg-purple-100');
      expect(businessLabel.className).toContain('text-purple-800');

      const academicLabel = screen.getByText('学术写作');
      expect(academicLabel.className).toContain('bg-green-100');
      expect(academicLabel.className).toContain('text-green-800');
    });

    it('should not filter regular chains when filterContexts is provided', () => {
      // Regular chains don't have context, so they should be filtered out
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
          filterContexts={['daily-conversation']}
        />
      );

      // All regular chains should be filtered out
      expect(screen.getByText('暂无句子链')).toBeInTheDocument();
    });

    it('should maintain backward compatibility with regular SentenceChain array', () => {
      // Regular chains should work without context labels
      render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check that sentences are rendered (using function matcher for highlighted text)
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' && element?.textContent?.includes('The apple tree in my garden is very tall');
      })).toBeInTheDocument();
      
      // No context labels should be displayed
      expect(screen.queryByText('日常对话')).not.toBeInTheDocument();
    });

    it('should highlight different words with different colors', () => {
      // Requirement 8.5: Multi-color word highlighting
      const { container } = render(
        <SentenceChainSection
          sentenceChains={mockSentenceChains}
          words={mockWords}
        />
      );

      // Check that words are highlighted with different colors
      const marks = container.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);

      // Collect all color classes used
      const colorClasses = new Set<string>();
      marks.forEach(mark => {
        const classList = Array.from(mark.classList);
        const colorClass = classList.find(cls => cls.startsWith('bg-'));
        if (colorClass) {
          colorClasses.add(colorClass);
        }
      });

      // Should have multiple different colors (blue, green, purple, orange, pink)
      // At least 2 different colors should be used since we have multiple words
      expect(colorClasses.size).toBeGreaterThanOrEqual(2);
      
      // Verify the colors are from our expected set
      const expectedColors = ['bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-orange-200', 'bg-pink-200'];
      colorClasses.forEach(colorClass => {
        expect(expectedColors).toContain(colorClass);
      });
    });

    it('should display quality score for enhanced chains', () => {
      // Requirement 8.5: Display quality score
      render(
        <SentenceChainSection
          sentenceChains={mockEnhancedChains}
          words={mockWords}
        />
      );

      // Check that quality scores are displayed
      expect(screen.getByText(/质量: 85%/)).toBeInTheDocument();
      expect(screen.getByText(/质量: 78%/)).toBeInTheDocument();
      expect(screen.getByText(/质量: 92%/)).toBeInTheDocument();
    });
  });
});

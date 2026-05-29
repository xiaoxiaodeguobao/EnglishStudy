/**
 * ExampleSentences Component Tests
 * 
 * Tests for the ExampleSentences component
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExampleSentences } from './ExampleSentences';
import { ExampleSentence } from '../types/word';

describe('ExampleSentences', () => {
  it('should render a single example sentence with translation', () => {
    // Requirement 7.1, 7.4
    const examples: ExampleSentence[] = [
      {
        sentence: 'I love reading books.',
        translation: '我喜欢读书。',
        highlightWord: 'books',
      },
    ];

    render(<ExampleSentences examples={examples} />);

    // Check sentence is displayed (use function matcher for text split by elements, target only p tag)
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'I love reading books.';
    })).toBeInTheDocument();
    
    // Check translation is displayed
    expect(screen.getByText('我喜欢读书。')).toBeInTheDocument();
  });

  it('should render multiple example sentences', () => {
    // Requirement 7.1
    const examples: ExampleSentence[] = [
      {
        sentence: 'She reads a book every day.',
        translation: '她每天读一本书。',
        highlightWord: 'book',
      },
      {
        sentence: 'This is my favorite book.',
        translation: '这是我最喜欢的书。',
        highlightWord: 'book',
      },
      {
        sentence: 'I need to book a flight.',
        translation: '我需要预订航班。',
        highlightWord: 'book',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Check all sentences are displayed by checking the container has all text
    const allParagraphs = container.querySelectorAll('p.text-base');
    expect(allParagraphs).toHaveLength(3);
    
    const sentenceTexts = Array.from(allParagraphs).map(p => p.textContent);
    expect(sentenceTexts).toContain('She reads a book every day.');
    expect(sentenceTexts).toContain('This is my favorite book.');
    expect(sentenceTexts).toContain('I need to book a flight.');
    
    // Check all translations are displayed
    expect(screen.getByText('她每天读一本书。')).toBeInTheDocument();
    expect(screen.getByText('这是我最喜欢的书。')).toBeInTheDocument();
    expect(screen.getByText('我需要预订航班。')).toBeInTheDocument();
  });

  it('should highlight the target word in the sentence', () => {
    // Requirement 7.3
    const examples: ExampleSentence[] = [
      {
        sentence: 'The quick brown fox jumps.',
        translation: '敏捷的棕色狐狸跳跃。',
        highlightWord: 'quick',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Check that the word is highlighted with mark element
    const markElement = container.querySelector('mark');
    expect(markElement).toBeInTheDocument();
    expect(markElement?.textContent).toBe('quick');
    
    // Check that the mark has highlighting styles
    expect(markElement?.className).toContain('bg-yellow-200');
  });

  it('should highlight word case-insensitively', () => {
    // Requirement 7.3 - handle different cases
    const examples: ExampleSentence[] = [
      {
        sentence: 'Book your tickets now. I have a book.',
        translation: '现在预订您的票。我有一本书。',
        highlightWord: 'book',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Check that both "Book" and "book" are highlighted
    const markElements = container.querySelectorAll('mark');
    expect(markElements).toHaveLength(2);
    expect(markElements[0].textContent).toBe('Book');
    expect(markElements[1].textContent).toBe('book');
  });

  it('should highlight multiple occurrences of the target word', () => {
    // Requirement 7.3
    const examples: ExampleSentence[] = [
      {
        sentence: 'The book on the table is a good book.',
        translation: '桌子上的书是一本好书。',
        highlightWord: 'book',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Check that both occurrences are highlighted
    const markElements = container.querySelectorAll('mark');
    expect(markElements).toHaveLength(2);
    expect(markElements[0].textContent).toBe('book');
    expect(markElements[1].textContent).toBe('book');
  });

  it('should handle empty examples array gracefully', () => {
    render(<ExampleSentences examples={[]} />);

    // Should display a message when no examples are available
    expect(screen.getByText('暂无例句')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const examples: ExampleSentence[] = [
      {
        sentence: 'Test sentence.',
        translation: '测试句子。',
        highlightWord: 'Test',
      },
    ];

    const { container } = render(
      <ExampleSentences examples={examples} className="custom-class" />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.className).toContain('custom-class');
  });

  it('should handle sentences without the target word', () => {
    // Edge case: target word not in sentence
    const examples: ExampleSentence[] = [
      {
        sentence: 'This is a test sentence.',
        translation: '这是一个测试句子。',
        highlightWord: 'missing',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Should still render the sentence without highlighting
    expect(screen.getByText('This is a test sentence.')).toBeInTheDocument();
    
    // Should not have any mark elements
    const markElements = container.querySelectorAll('mark');
    expect(markElements).toHaveLength(0);
  });

  it('should handle empty highlightWord gracefully', () => {
    const examples: ExampleSentence[] = [
      {
        sentence: 'This is a sentence.',
        translation: '这是一个句子。',
        highlightWord: '',
      },
    ];

    render(<ExampleSentences examples={examples} />);

    // Should render the sentence without errors
    expect(screen.getByText('This is a sentence.')).toBeInTheDocument();
  });

  it('should handle special characters in sentences', () => {
    const examples: ExampleSentence[] = [
      {
        sentence: 'What? Really! That\'s amazing...',
        translation: '什么？真的！太棒了...',
        highlightWord: 'amazing',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    const sentenceParagraph = container.querySelector('p.text-base');
    expect(sentenceParagraph?.textContent).toBe('What? Really! That\'s amazing...');
    expect(screen.getByText('什么？真的！太棒了...')).toBeInTheDocument();
    
    // Check that "amazing" is still highlighted despite punctuation
    const markElement = container.querySelector('mark');
    expect(markElement?.textContent).toBe('amazing');
  });

  it('should not highlight partial word matches', () => {
    // Word boundaries should prevent partial matches
    const examples: ExampleSentence[] = [
      {
        sentence: 'I am booking a table.',
        translation: '我正在预订一张桌子。',
        highlightWord: 'book',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // "booking" should not be highlighted, only exact word "book"
    const markElements = container.querySelectorAll('mark');
    expect(markElements).toHaveLength(0);
  });

  it('should handle long sentences without breaking layout', () => {
    const examples: ExampleSentence[] = [
      {
        sentence: 'This is a very long example sentence that contains many words and is used to test whether the component can properly handle long text content without breaking the layout structure or causing any visual issues.',
        translation: '这是一个非常长的例句，包含许多单词，用于测试组件是否能够正确处理长文本内容而不会破坏布局结构或导致任何视觉问题。',
        highlightWord: 'example',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    const sentenceParagraph = container.querySelector('p.text-base');
    expect(sentenceParagraph?.textContent).toContain('This is a very long example sentence');
    
    // Check that "example" is highlighted
    const markElement = container.querySelector('mark');
    expect(markElement?.textContent).toBe('example');
  });

  it('should render examples with proper visual structure', () => {
    // Requirement 7.1, 7.4 - structured display
    const examples: ExampleSentence[] = [
      {
        sentence: 'First example.',
        translation: '第一个例子。',
        highlightWord: 'example',
      },
      {
        sentence: 'Second example.',
        translation: '第二个例子。',
        highlightWord: 'example',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Check that examples are in separate containers
    const exampleContainers = container.querySelectorAll('.bg-gray-50');
    expect(exampleContainers).toHaveLength(2);
    
    // Check that translations are separated with borders
    const translationSeparators = container.querySelectorAll('.border-t');
    expect(translationSeparators).toHaveLength(2);
  });

  it('should handle examples covering different parts of speech', () => {
    // Requirement 7.2 - examples should cover different usages
    const examples: ExampleSentence[] = [
      {
        sentence: 'I read a book yesterday.',
        translation: '我昨天读了一本书。',
        highlightWord: 'book',
      },
      {
        sentence: 'Please book a room for me.',
        translation: '请为我预订一个房间。',
        highlightWord: 'book',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // Both examples should be rendered (noun and verb usage)
    const allParagraphs = container.querySelectorAll('p.text-base');
    const sentenceTexts = Array.from(allParagraphs).map(p => p.textContent);
    expect(sentenceTexts).toContain('I read a book yesterday.');
    expect(sentenceTexts).toContain('Please book a room for me.');
  });

  it('should handle word with different forms in sentence', () => {
    // Test highlighting with word variations
    const examples: ExampleSentence[] = [
      {
        sentence: 'Run fast to catch the bus.',
        translation: '快跑去赶公交车。',
        highlightWord: 'Run',
      },
    ];

    const { container } = render(<ExampleSentences examples={examples} />);

    // "Run" should be highlighted (case-insensitive)
    const markElement = container.querySelector('mark');
    expect(markElement?.textContent).toBe('Run');
  });
});

describe('ExampleSentences - Enhanced Features', () => {
  it('should accept and render EnhancedExampleSentence array', () => {
    // Requirement 8.1
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'I love reading books.',
        translation: '我喜欢读书。',
        highlightWord: 'books',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.90,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 100,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} />);

    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'I love reading books.';
    })).toBeInTheDocument();
    expect(screen.getByText('我喜欢读书。')).toBeInTheDocument();
  });

  it('should group examples by context when groupByContext is true', () => {
    // Requirement 8.1, 8.2
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Let\'s grab coffee.',
        translation: '我们去喝咖啡吧。',
        highlightWord: 'coffee',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'The quarterly report shows growth.',
        translation: '季度报告显示增长。',
        highlightWord: 'report',
        context: 'business-communication',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 60,
        },
      },
      {
        sentence: 'Good morning!',
        translation: '早上好!',
        highlightWord: 'morning',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 40,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} groupByContext={true} />);

    // Check for context labels
    expect(screen.getByText('日常对话')).toBeInTheDocument();
    expect(screen.getByText('商务交流')).toBeInTheDocument();
    
    // Check for example count indicators
    expect(screen.getByText('(2 个例句)')).toBeInTheDocument();
    expect(screen.getByText('(1 个例句)')).toBeInTheDocument();
  });

  it('should not group examples when groupByContext is false', () => {
    // Requirement 8.1
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Let\'s grab coffee.',
        translation: '我们去喝咖啡吧。',
        highlightWord: 'coffee',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'The quarterly report shows growth.',
        translation: '季度报告显示增长。',
        highlightWord: 'report',
        context: 'business-communication',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 60,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} groupByContext={false} />);

    // Context labels should not be present
    expect(screen.queryByText('日常对话')).not.toBeInTheDocument();
    expect(screen.queryByText('商务交流')).not.toBeInTheDocument();
    
    // But examples should still be rendered (use function matcher for text split by elements)
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Let\'s grab coffee.';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'The quarterly report shows growth.';
    })).toBeInTheDocument();
  });

  it('should show quality indicators when showQualityIndicators is true', () => {
    // Requirement 8.6
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'I love reading books.',
        translation: '我喜欢读书。',
        highlightWord: 'books',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.90,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 100,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={true} />);

    // Check for quality indicator labels
    expect(screen.getByText('多样性:')).toBeInTheDocument();
    expect(screen.getByText('自然度:')).toBeInTheDocument();
    
    // Check for score values
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('should not show quality indicators when showQualityIndicators is false', () => {
    // Requirement 8.6
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'I love reading books.',
        translation: '我喜欢读书。',
        highlightWord: 'books',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.90,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 100,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={false} />);

    // Quality indicators should not be present
    expect(screen.queryByText('多样性:')).not.toBeInTheDocument();
    expect(screen.queryByText('自然度:')).not.toBeInTheDocument();
  });

  it('should filter examples by context when filterContexts is provided', () => {
    // Requirement 8.6
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Let\'s grab coffee.',
        translation: '我们去喝咖啡吧。',
        highlightWord: 'coffee',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'The quarterly report shows growth.',
        translation: '季度报告显示增长。',
        highlightWord: 'report',
        context: 'business-communication',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 60,
        },
      },
      {
        sentence: 'The research methodology is sound.',
        translation: '研究方法是合理的。',
        highlightWord: 'research',
        context: 'academic-writing',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 70,
        },
      },
    ];

    render(
      <ExampleSentences 
        examples={enhancedExamples} 
        filterContexts={['daily-conversation', 'business-communication']}
      />
    );

    // Should show filtered contexts (use function matcher for text split by elements)
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Let\'s grab coffee.';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'The quarterly report shows growth.';
    })).toBeInTheDocument();
    
    // Should not show filtered out context
    expect(screen.queryByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'The research methodology is sound.';
    })).not.toBeInTheDocument();
  });

  it('should display all context types correctly', () => {
    // Requirement 8.2
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Daily example.',
        translation: '日常例句。',
        highlightWord: 'Daily',
        context: 'daily-conversation',
        metadata: { generatedAt: new Date(), model: 'gpt-4', tokensUsed: 50 },
      },
      {
        sentence: 'Business example.',
        translation: '商务例句。',
        highlightWord: 'Business',
        context: 'business-communication',
        metadata: { generatedAt: new Date(), model: 'gpt-4', tokensUsed: 50 },
      },
      {
        sentence: 'Academic example.',
        translation: '学术例句。',
        highlightWord: 'Academic',
        context: 'academic-writing',
        metadata: { generatedAt: new Date(), model: 'gpt-4', tokensUsed: 50 },
      },
      {
        sentence: 'Technical example.',
        translation: '技术例句。',
        highlightWord: 'Technical',
        context: 'technical-documentation',
        metadata: { generatedAt: new Date(), model: 'gpt-4', tokensUsed: 50 },
      },
      {
        sentence: 'Literary example.',
        translation: '文学例句。',
        highlightWord: 'Literary',
        context: 'literary-expression',
        metadata: { generatedAt: new Date(), model: 'gpt-4', tokensUsed: 50 },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} groupByContext={true} />);

    // Check all context labels are displayed
    expect(screen.getByText('日常对话')).toBeInTheDocument();
    expect(screen.getByText('商务交流')).toBeInTheDocument();
    expect(screen.getByText('学术写作')).toBeInTheDocument();
    expect(screen.getByText('技术文档')).toBeInTheDocument();
    expect(screen.getByText('文学表达')).toBeInTheDocument();
  });

  it('should handle mixed basic and enhanced examples', () => {
    // Backward compatibility test
    const mixedExamples: (ExampleSentence | EnhancedExampleSentence)[] = [
      {
        sentence: 'Basic example.',
        translation: '基本例句。',
        highlightWord: 'Basic',
      },
      {
        sentence: 'Enhanced example.',
        translation: '增强例句。',
        highlightWord: 'Enhanced',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(<ExampleSentences examples={mixedExamples} />);

    // Both should be rendered (use function matcher for text split by elements)
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Basic example.';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Enhanced example.';
    })).toBeInTheDocument();
  });

  it('should use correct color coding for quality scores', () => {
    // Requirement 8.6
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'High quality example.',
        translation: '高质量例句。',
        highlightWord: 'quality',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.90,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'Medium quality example.',
        translation: '中等质量例句。',
        highlightWord: 'quality',
        context: 'daily-conversation',
        diversityScore: 0.65,
        naturalnessScore: 0.70,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'Low quality example.',
        translation: '低质量例句。',
        highlightWord: 'quality',
        context: 'daily-conversation',
        diversityScore: 0.45,
        naturalnessScore: 0.50,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    const { container } = render(
      <ExampleSentences examples={enhancedExamples} showQualityIndicators={true} groupByContext={false} />
    );

    // Check for color classes
    const scoreElements = container.querySelectorAll('span[class*="text-"]');
    const colorClasses = Array.from(scoreElements).map(el => el.className);
    
    // Should have green (high), yellow (medium), and red (low) scores
    expect(colorClasses.some(cls => cls.includes('text-green-600'))).toBe(true);
    expect(colorClasses.some(cls => cls.includes('text-yellow-600'))).toBe(true);
    expect(colorClasses.some(cls => cls.includes('text-red-600'))).toBe(true);
  });

  it('should handle empty filtered results gracefully', () => {
    // Edge case: filter results in no examples
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Business example.',
        translation: '商务例句。',
        highlightWord: 'Business',
        context: 'business-communication',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(
      <ExampleSentences 
        examples={enhancedExamples} 
        filterContexts={['academic-writing']}
      />
    );

    // Should show "no examples" message
    expect(screen.getByText('暂无例句')).toBeInTheDocument();
  });

  it('should handle examples with missing quality scores', () => {
    // Edge case: enhanced examples without quality scores
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Example without scores.',
        translation: '没有评分的例句。',
        highlightWord: 'Example',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={true} />);

    // Should render without errors (use function matcher for text split by elements)
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Example without scores.';
    })).toBeInTheDocument();
    
    // No quality indicators should be shown
    expect(screen.queryByText('多样性:')).not.toBeInTheDocument();
    expect(screen.queryByText('自然度:')).not.toBeInTheDocument();
  });

  it('should handle examples with partial quality scores', () => {
    // Edge case: only one quality score present
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Example with partial scores.',
        translation: '部分评分的例句。',
        highlightWord: 'Example',
        context: 'daily-conversation',
        diversityScore: 0.85,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={true} />);

    // Should show only the available score
    expect(screen.getByText('多样性:')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.queryByText('自然度:')).not.toBeInTheDocument();
  });

  it('should display sentence length when quality indicators are shown', () => {
    // Requirement 8.3
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'This is a test sentence with eight words.',
        translation: '这是一个有八个单词的测试句子。',
        highlightWord: 'test',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.90,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={true} />);

    // Should show sentence length
    expect(screen.getByText('长度:')).toBeInTheDocument();
    expect(screen.getByText('8 词')).toBeInTheDocument();
  });

  it('should display correct word count for various sentence lengths', () => {
    // Requirement 8.3
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Short.',
        translation: '短。',
        highlightWord: 'Short',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 20,
        },
      },
      {
        sentence: 'This is a medium length sentence for testing.',
        translation: '这是一个中等长度的测试句子。',
        highlightWord: 'medium',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'This is a very long example sentence that contains many words and is used to test whether the component can properly display the word count.',
        translation: '这是一个非常长的例句。',
        highlightWord: 'example',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 100,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={true} groupByContext={false} />);

    // Should show correct word counts
    expect(screen.getByText('1 词')).toBeInTheDocument();
    expect(screen.getByText('8 词')).toBeInTheDocument();
    expect(screen.getByText('25 词')).toBeInTheDocument();
  });

  it('should not display sentence length when quality indicators are disabled', () => {
    // Requirement 8.3
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'This is a test sentence.',
        translation: '这是一个测试句子。',
        highlightWord: 'test',
        context: 'daily-conversation',
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={false} />);

    // Should not show sentence length
    expect(screen.queryByText('长度:')).not.toBeInTheDocument();
  });

  it('should display all quality indicators together when available', () => {
    // Requirement 8.3, 9.6
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'Complete quality indicators example sentence here.',
        translation: '完整的质量指标例句。',
        highlightWord: 'quality',
        context: 'daily-conversation',
        diversityScore: 0.82,
        naturalnessScore: 0.88,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    render(<ExampleSentences examples={enhancedExamples} showQualityIndicators={true} />);

    // Should show all three indicators
    expect(screen.getByText('多样性:')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('自然度:')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('长度:')).toBeInTheDocument();
    expect(screen.getByText('6 词')).toBeInTheDocument();
  });

  it('should use color-coded badges for quality scores', () => {
    // Requirement 8.3 - green ≥80%, yellow ≥60%, red <60%
    const enhancedExamples: EnhancedExampleSentence[] = [
      {
        sentence: 'High score example.',
        translation: '高分例句。',
        highlightWord: 'High',
        context: 'daily-conversation',
        diversityScore: 0.85,
        naturalnessScore: 0.90,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'Medium score example.',
        translation: '中等分数例句。',
        highlightWord: 'Medium',
        context: 'daily-conversation',
        diversityScore: 0.65,
        naturalnessScore: 0.70,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
      {
        sentence: 'Low score example.',
        translation: '低分例句。',
        highlightWord: 'Low',
        context: 'daily-conversation',
        diversityScore: 0.45,
        naturalnessScore: 0.50,
        metadata: {
          generatedAt: new Date(),
          model: 'gpt-4',
          tokensUsed: 50,
        },
      },
    ];

    const { container } = render(
      <ExampleSentences examples={enhancedExamples} showQualityIndicators={true} groupByContext={false} />
    );

    // Check for green scores (≥80%)
    const greenScores = container.querySelectorAll('.text-green-600');
    expect(greenScores.length).toBeGreaterThan(0);

    // Check for yellow scores (≥60%)
    const yellowScores = container.querySelectorAll('.text-yellow-600');
    expect(yellowScores.length).toBeGreaterThan(0);

    // Check for red scores (<60%)
    const redScores = container.querySelectorAll('.text-red-600');
    expect(redScores.length).toBeGreaterThan(0);
  });

  it('should maintain backward compatibility with basic ExampleSentence array', () => {
    // Ensure old code still works
    const basicExamples: ExampleSentence[] = [
      {
        sentence: 'Old style example.',
        translation: '旧式例句。',
        highlightWord: 'example',
      },
    ];

    render(<ExampleSentences examples={basicExamples} />);

    // Use function matcher for text split by elements
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Old style example.';
    })).toBeInTheDocument();
    expect(screen.getByText('旧式例句。')).toBeInTheDocument();
    
    // Should not show context labels or quality indicators
    expect(screen.queryByText('日常对话')).not.toBeInTheDocument();
    expect(screen.queryByText('多样性:')).not.toBeInTheDocument();
  });
});

// Import the enhanced types for testing
import { EnhancedExampleSentence } from '../services/enhanced/types';

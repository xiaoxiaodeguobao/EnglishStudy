/**
 * WordAssociationDisplay Component Tests
 * 
 * Tests the WordAssociationDisplay component's rendering and behavior
 * Requirements: 4.2, 4.3, 4.4
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WordAssociationDisplay } from './WordAssociationDisplay';
import { Word } from '../types/word';
import { WordAssociation } from '../types/wordList';

describe('WordAssociationDisplay', () => {
  const mockWords: Word[] = [
    {
      id: 'word-1',
      word: 'happy',
      phonetic: '/ˈhæpi/',
      definitions: [
        {
          partOfSpeech: 'adjective',
          meaningCN: '快乐的',
          meaningEN: 'feeling or showing pleasure',
        },
      ],
      examples: [],
      associations: ['word-2'],
      generatedAt: new Date('2024-01-01'),
    },
    {
      id: 'word-2',
      word: 'joyful',
      phonetic: '/ˈdʒɔɪfəl/',
      definitions: [
        {
          partOfSpeech: 'adjective',
          meaningCN: '欢乐的',
          meaningEN: 'feeling great happiness',
        },
      ],
      examples: [],
      associations: ['word-1'],
      generatedAt: new Date('2024-01-01'),
    },
    {
      id: 'word-3',
      word: 'happiness',
      phonetic: '/ˈhæpinəs/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '幸福',
          meaningEN: 'the state of being happy',
        },
      ],
      examples: [],
      associations: ['word-1'],
      generatedAt: new Date('2024-01-01'),
    },
  ];

  const mockAssociations: WordAssociation[] = [
    {
      word1Id: 'word-1',
      word2Id: 'word-2',
      associationType: 'semantic',
      description: '两个词都表示快乐的情绪，语义相近',
    },
    {
      word1Id: 'word-1',
      word2Id: 'word-3',
      associationType: 'root',
      description: 'happiness 是 happy 的名词形式，共享词根',
    },
  ];

  it('should render empty state when no associations provided', () => {
    // Requirement 4.4 - Handle empty states gracefully
    render(<WordAssociationDisplay associations={[]} words={mockWords} />);

    expect(screen.getByText('暂无单词关联')).toBeInTheDocument();
    expect(
      screen.getByText('当有多个单词时，系统会自动识别它们之间的关联关系')
    ).toBeInTheDocument();
  });

  it('should display association count summary', () => {
    // Requirement 4.3 - Display association information
    render(<WordAssociationDisplay associations={mockAssociations} words={mockWords} />);

    expect(screen.getByText(/发现 2 个单词关联/)).toBeInTheDocument();
  });

  it('should display word pairs for each association', () => {
    // Requirement 4.2, 4.3 - Display word associations
    render(<WordAssociationDisplay associations={mockAssociations} words={mockWords} />);

    // Check first association - use getAllByText since words appear multiple times
    const happyElements = screen.getAllByText('happy');
    expect(happyElements.length).toBeGreaterThan(0);
    expect(screen.getByText('joyful')).toBeInTheDocument();

    // Check second association
    expect(screen.getByText('happiness')).toBeInTheDocument();
  });

  it('should display association type badges', () => {
    // Requirement 4.2, 4.3 - Visualize association types
    render(<WordAssociationDisplay associations={mockAssociations} words={mockWords} />);

    expect(screen.getByText('语义关联')).toBeInTheDocument();
    expect(screen.getByText('词根关联')).toBeInTheDocument();
  });

  it('should display association descriptions', () => {
    // Requirement 4.3 - Display association descriptions
    render(<WordAssociationDisplay associations={mockAssociations} words={mockWords} />);

    expect(screen.getByText('两个词都表示快乐的情绪，语义相近')).toBeInTheDocument();
    expect(screen.getByText('happiness 是 happy 的名词形式，共享词根')).toBeInTheDocument();
  });

  it('should display legend explaining association types', () => {
    // Requirement 4.2 - Explain association types
    render(<WordAssociationDisplay associations={mockAssociations} words={mockWords} />);

    expect(screen.getByText('关联类型说明：')).toBeInTheDocument();
    expect(screen.getByText(/主题关联：/)).toBeInTheDocument();
    expect(screen.getByText(/语义关联：/)).toBeInTheDocument();
    expect(screen.getByText(/词根关联：/)).toBeInTheDocument();
    expect(screen.getByText(/场景关联：/)).toBeInTheDocument();
  });

  it('should handle all association types correctly', () => {
    // Requirement 4.2 - Support all association types
    const allTypesAssociations: WordAssociation[] = [
      {
        word1Id: 'word-1',
        word2Id: 'word-2',
        associationType: 'theme',
        description: '主题关联示例',
      },
      {
        word1Id: 'word-1',
        word2Id: 'word-3',
        associationType: 'semantic',
        description: '语义关联示例',
      },
    ];

    render(<WordAssociationDisplay associations={allTypesAssociations} words={mockWords} />);

    expect(screen.getByText('主题关联')).toBeInTheDocument();
    expect(screen.getByText('语义关联')).toBeInTheDocument();
  });

  it('should skip associations with missing words', () => {
    // Requirement 4.4 - Handle edge cases gracefully
    const associationsWithMissingWord: WordAssociation[] = [
      {
        word1Id: 'word-1',
        word2Id: 'word-999', // Non-existent word
        associationType: 'semantic',
        description: 'This should not be displayed',
      },
      {
        word1Id: 'word-1',
        word2Id: 'word-2',
        associationType: 'semantic',
        description: 'This should be displayed',
      },
    ];

    render(
      <WordAssociationDisplay associations={associationsWithMissingWord} words={mockWords} />
    );

    // Should display the valid association
    expect(screen.getByText('This should be displayed')).toBeInTheDocument();
    // Should not display the invalid association
    expect(screen.queryByText('This should not be displayed')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    // Test custom styling support
    const { container } = render(
      <WordAssociationDisplay
        associations={mockAssociations}
        words={mockWords}
        className="custom-class"
      />
    );

    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.className).toContain('custom-class');
  });

  it('should display context association type', () => {
    // Requirement 4.2 - Support context association type
    const contextAssociation: WordAssociation[] = [
      {
        word1Id: 'word-1',
        word2Id: 'word-2',
        associationType: 'context',
        description: '这两个词常在相同场景中使用',
      },
    ];

    render(<WordAssociationDisplay associations={contextAssociation} words={mockWords} />);

    expect(screen.getByText('场景关联')).toBeInTheDocument();
    expect(screen.getByText('这两个词常在相同场景中使用')).toBeInTheDocument();
  });

  it('should display root association type', () => {
    // Requirement 4.2 - Support root association type
    const rootAssociation: WordAssociation[] = [
      {
        word1Id: 'word-1',
        word2Id: 'word-3',
        associationType: 'root',
        description: '共享相同的词根',
      },
    ];

    render(<WordAssociationDisplay associations={rootAssociation} words={mockWords} />);

    expect(screen.getByText('词根关联')).toBeInTheDocument();
    expect(screen.getByText('共享相同的词根')).toBeInTheDocument();
  });
});

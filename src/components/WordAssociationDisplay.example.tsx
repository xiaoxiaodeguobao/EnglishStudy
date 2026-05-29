/**
 * WordAssociationDisplay Component Examples
 * 
 * Demonstrates various use cases of the WordAssociationDisplay component
 */

import { WordAssociationDisplay } from './WordAssociationDisplay';
import { Word } from '../types/word';
import { WordAssociation } from '../types/wordList';

// Example words for demonstration
const exampleWords: Word[] = [
  {
    id: 'word-1',
    word: 'happy',
    phonetic: '/ˈhæpi/',
    definitions: [
      {
        partOfSpeech: 'adjective',
        meaningCN: '快乐的；幸福的',
        meaningEN: 'feeling or showing pleasure or contentment',
      },
    ],
    examples: [],
    associations: ['word-2', 'word-3'],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-2',
    word: 'joyful',
    phonetic: '/ˈdʒɔɪfəl/',
    definitions: [
      {
        partOfSpeech: 'adjective',
        meaningCN: '欢乐的；高兴的',
        meaningEN: 'feeling, expressing, or causing great pleasure and happiness',
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
        meaningCN: '幸福；快乐',
        meaningEN: 'the state of being happy',
      },
    ],
    examples: [],
    associations: ['word-1'],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-4',
    word: 'celebrate',
    phonetic: '/ˈseləbreɪt/',
    definitions: [
      {
        partOfSpeech: 'verb',
        meaningCN: '庆祝；庆贺',
        meaningEN: 'acknowledge a significant or happy day or event with a social gathering or enjoyable activity',
      },
    ],
    examples: [],
    associations: ['word-2'],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-5',
    word: 'restaurant',
    phonetic: '/ˈrestrɒnt/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '餐厅；饭店',
        meaningEN: 'a place where people pay to sit and eat meals',
      },
    ],
    examples: [],
    associations: ['word-6'],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-6',
    word: 'menu',
    phonetic: '/ˈmenjuː/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '菜单',
        meaningEN: 'a list of dishes available in a restaurant',
      },
    ],
    examples: [],
    associations: ['word-5'],
    generatedAt: new Date('2024-01-01'),
  },
];

// Example 1: Semantic associations
const semanticAssociations: WordAssociation[] = [
  {
    word1Id: 'word-1',
    word2Id: 'word-2',
    associationType: 'semantic',
    description: '两个词都表示快乐的情绪，happy 更常用，joyful 语气更强烈',
  },
];

// Example 2: Root associations
const rootAssociations: WordAssociation[] = [
  {
    word1Id: 'word-1',
    word2Id: 'word-3',
    associationType: 'root',
    description: 'happiness 是 happy 的名词形式，共享词根 happ-',
  },
];

// Example 3: Context associations
const contextAssociations: WordAssociation[] = [
  {
    word1Id: 'word-2',
    word2Id: 'word-4',
    associationType: 'context',
    description: '在庆祝活动中，人们通常会感到 joyful，这两个词经常在同一场景中出现',
  },
  {
    word1Id: 'word-5',
    word2Id: 'word-6',
    associationType: 'context',
    description: '在餐厅用餐时，顾客会查看菜单，这两个词在用餐场景中紧密相关',
  },
];

// Example 4: Theme associations
const themeAssociations: WordAssociation[] = [
  {
    word1Id: 'word-1',
    word2Id: 'word-2',
    associationType: 'theme',
    description: '都属于"情绪和感受"主题',
  },
  {
    word1Id: 'word-2',
    word2Id: 'word-4',
    associationType: 'theme',
    description: '都与"快乐和庆祝"主题相关',
  },
];

// Example 5: Mixed associations
const mixedAssociations: WordAssociation[] = [
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
  {
    word1Id: 'word-2',
    word2Id: 'word-4',
    associationType: 'context',
    description: '在庆祝活动中常一起使用',
  },
  {
    word1Id: 'word-5',
    word2Id: 'word-6',
    associationType: 'theme',
    description: '都属于"餐饮"主题',
  },
];

export function WordAssociationDisplayExamples() {
  return (
    <div className="space-y-12 p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        WordAssociationDisplay Component Examples
      </h1>

      {/* Example 1: Empty State */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 1: Empty State
        </h2>
        <p className="text-gray-600 mb-4">
          When there are no associations to display
        </p>
        <WordAssociationDisplay associations={[]} words={exampleWords} />
      </section>

      {/* Example 2: Semantic Associations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 2: Semantic Associations
        </h2>
        <p className="text-gray-600 mb-4">
          Words with similar meanings
        </p>
        <WordAssociationDisplay
          associations={semanticAssociations}
          words={exampleWords}
        />
      </section>

      {/* Example 3: Root Associations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 3: Root Associations
        </h2>
        <p className="text-gray-600 mb-4">
          Words sharing common roots
        </p>
        <WordAssociationDisplay
          associations={rootAssociations}
          words={exampleWords}
        />
      </section>

      {/* Example 4: Context Associations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 4: Context Associations
        </h2>
        <p className="text-gray-600 mb-4">
          Words commonly used in the same context
        </p>
        <WordAssociationDisplay
          associations={contextAssociations}
          words={exampleWords}
        />
      </section>

      {/* Example 5: Theme Associations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 5: Theme Associations
        </h2>
        <p className="text-gray-600 mb-4">
          Words belonging to the same theme
        </p>
        <WordAssociationDisplay
          associations={themeAssociations}
          words={exampleWords}
        />
      </section>

      {/* Example 6: Mixed Associations */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 6: Mixed Association Types
        </h2>
        <p className="text-gray-600 mb-4">
          Multiple associations with different types
        </p>
        <WordAssociationDisplay
          associations={mixedAssociations}
          words={exampleWords}
        />
      </section>

      {/* Example 7: Custom Styling */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 7: Custom Styling
        </h2>
        <p className="text-gray-600 mb-4">
          Component with custom className
        </p>
        <WordAssociationDisplay
          associations={semanticAssociations}
          words={exampleWords}
          className="border-2 border-blue-500 rounded-lg p-4"
        />
      </section>
    </div>
  );
}

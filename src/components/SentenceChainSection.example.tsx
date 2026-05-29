/**
 * SentenceChainSection Component Examples
 * 
 * Demonstrates various usage scenarios of the SentenceChainSection component
 */

import { SentenceChainSection } from './SentenceChainSection';
import { SentenceChain } from '../types/wordList';
import { Word } from '../types/word';

// Example words
const exampleWords: Word[] = [
  {
    id: 'word-1',
    word: 'ocean',
    phonetic: '/ˈoʊʃən/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '海洋',
        meaningEN: 'a very large expanse of sea',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-2',
    word: 'wave',
    phonetic: '/weɪv/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '波浪',
        meaningEN: 'a moving ridge on the surface of water',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-3',
    word: 'beach',
    phonetic: '/biːtʃ/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '海滩',
        meaningEN: 'a pebbly or sandy shore',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date('2024-01-01'),
  },
  {
    id: 'word-4',
    word: 'sunset',
    phonetic: '/ˈsʌnset/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '日落',
        meaningEN: 'the time when the sun goes down',
      },
    ],
    examples: [],
    associations: [],
    generatedAt: new Date('2024-01-01'),
  },
];

// Example sentence chains
const exampleChains: SentenceChain[] = [
  {
    id: 'chain-1',
    sentence: 'The ocean waves crash against the beach at sunset.',
    usedWordIds: ['word-1', 'word-2', 'word-3', 'word-4'],
    translation: '海浪在日落时分拍打着海滩。',
  },
  {
    id: 'chain-2',
    sentence: 'We watched the beautiful sunset from the beach near the ocean.',
    usedWordIds: ['word-1', 'word-3', 'word-4'],
    translation: '我们在靠近海洋的海滩上观看美丽的日落。',
  },
  {
    id: 'chain-3',
    sentence: 'The waves at the beach were perfect for surfing.',
    usedWordIds: ['word-2', 'word-3'],
    translation: '海滩上的波浪非常适合冲浪。',
  },
];

/**
 * Example 1: Basic usage with sentence chains
 */
export function BasicExample() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sentence Chain Section - Basic Example</h1>
      <SentenceChainSection
        sentenceChains={exampleChains}
        words={exampleWords}
      />
    </div>
  );
}

/**
 * Example 2: Empty state
 */
export function EmptyStateExample() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sentence Chain Section - Empty State</h1>
      <SentenceChainSection
        sentenceChains={[]}
        words={exampleWords}
      />
    </div>
  );
}

/**
 * Example 3: Single sentence chain
 */
export function SingleChainExample() {
  const singleChain: SentenceChain[] = [
    {
      id: 'chain-single',
      sentence: 'The ocean is vast and beautiful.',
      usedWordIds: ['word-1'],
      translation: '海洋广阔而美丽。',
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sentence Chain Section - Single Chain</h1>
      <SentenceChainSection
        sentenceChains={singleChain}
        words={exampleWords}
      />
    </div>
  );
}

/**
 * Example 4: With custom className
 */
export function CustomClassExample() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sentence Chain Section - Custom Styling</h1>
      <SentenceChainSection
        sentenceChains={exampleChains}
        words={exampleWords}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}

/**
 * Example 5: Complex sentence with multiple word occurrences
 */
export function ComplexExample() {
  const complexWords: Word[] = [
    {
      id: 'word-a',
      word: 'time',
      phonetic: '/taɪm/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '时间',
          meaningEN: 'the indefinite continued progress of existence',
        },
      ],
      examples: [],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    },
    {
      id: 'word-b',
      word: 'moment',
      phonetic: '/ˈmoʊmənt/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '时刻',
          meaningEN: 'a very brief period of time',
        },
      ],
      examples: [],
      associations: [],
      generatedAt: new Date('2024-01-01'),
    },
  ];

  const complexChains: SentenceChain[] = [
    {
      id: 'chain-complex',
      sentence: 'Time flies when you enjoy every moment, but time seems slow when you waste time.',
      usedWordIds: ['word-a', 'word-b'],
      translation: '当你享受每一刻时，时间飞逝，但当你浪费时间时，时间似乎很慢。',
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sentence Chain Section - Complex Example</h1>
      <SentenceChainSection
        sentenceChains={complexChains}
        words={complexWords}
      />
    </div>
  );
}

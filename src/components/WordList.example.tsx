/**
 * WordList Component Examples
 * 
 * Demonstrates different states and usage patterns of the WordList component.
 */

import { WordList } from './WordList';
import type { Word } from '../types/word';

// Sample word data
const sampleWords: Word[] = [
  {
    id: '1',
    word: 'serendipity',
    phonetic: '/ˌserənˈdɪpɪti/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '意外发现珍奇事物的本领；有意外收获的运气',
        meaningEN: 'the occurrence of events by chance in a happy or beneficial way',
      },
    ],
    examples: [
      {
        sentence: 'A fortunate stroke of serendipity brought the two old friends together.',
        translation: '一次幸运的巧合让两位老朋友重逢了。',
        highlightWord: 'serendipity',
      },
      {
        sentence: 'The discovery was pure serendipity.',
        translation: '这个发现纯属意外收获。',
        highlightWord: 'serendipity',
      },
    ],
    associations: ['2'],
    generatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    word: 'fortuitous',
    phonetic: '/fɔːrˈtuːɪtəs/',
    definitions: [
      {
        partOfSpeech: 'adjective',
        meaningCN: '偶然的；意外的；幸运的',
        meaningEN: 'happening by accident or chance rather than design',
      },
    ],
    examples: [
      {
        sentence: 'The timing of the meeting was fortuitous.',
        translation: '会议的时间安排很巧合。',
        highlightWord: 'fortuitous',
      },
      {
        sentence: 'It was a fortuitous encounter that changed his life.',
        translation: '这是一次改变他人生的偶然相遇。',
        highlightWord: 'fortuitous',
      },
    ],
    associations: ['1', '3'],
    generatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    word: 'coincidence',
    phonetic: '/koʊˈɪnsɪdəns/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '巧合；巧事',
        meaningEN: 'a remarkable concurrence of events or circumstances without apparent causal connection',
      },
    ],
    examples: [
      {
        sentence: 'What a coincidence to meet you here!',
        translation: '在这里遇见你真是太巧了！',
        highlightWord: 'coincidence',
      },
      {
        sentence: 'It was no coincidence that they arrived at the same time.',
        translation: '他们同时到达并非巧合。',
        highlightWord: 'coincidence',
      },
    ],
    associations: ['2'],
    generatedAt: new Date('2024-01-15'),
  },
];

export function WordListExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        WordList Component Examples
      </h1>

      {/* Example 1: Normal word list */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          1. Normal Word List
        </h2>
        <p className="text-gray-600 mb-4">
          Displays a list of words with full information including definitions and examples.
        </p>
        <WordList words={sampleWords} />
      </section>

      {/* Example 2: Loading state */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          2. Loading State
        </h2>
        <p className="text-gray-600 mb-4">
          Shows a loading spinner while words are being fetched or generated.
        </p>
        <WordList words={[]} loading={true} />
      </section>

      {/* Example 3: Empty state */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          3. Empty State
        </h2>
        <p className="text-gray-600 mb-4">
          Displays a friendly message when there are no words to show.
        </p>
        <WordList words={[]} loading={false} />
      </section>

      {/* Example 4: Single word */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          4. Single Word
        </h2>
        <p className="text-gray-600 mb-4">
          Works correctly with just one word in the list.
        </p>
        <WordList words={[sampleWords[0]]} />
      </section>

      {/* Example 5: Custom styling */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          5. Custom Styling
        </h2>
        <p className="text-gray-600 mb-4">
          Can accept custom className for additional styling.
        </p>
        <WordList
          words={sampleWords.slice(0, 2)}
          className="bg-gray-50 p-6 rounded-lg"
        />
      </section>
    </div>
  );
}

export default WordListExamples;

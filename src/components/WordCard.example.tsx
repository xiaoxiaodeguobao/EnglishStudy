/**
 * WordCard Component Examples
 * 
 * Demonstrates usage of the WordCard component with various word configurations
 */

import { WordCard } from './WordCard';
import { Word } from '../types/word';

export function WordCardExamples() {
  // Example 1: Complete word with all information
  const completeWord: Word = {
    id: 'word-1',
    word: 'serendipity',
    phonetic: '/ˌserənˈdɪpɪti/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '意外发现珍奇事物的本领；有意外发现珍宝的运气',
        meaningEN: 'the occurrence and development of events by chance in a happy or beneficial way',
      },
    ],
    examples: [
      {
        sentence: 'A fortunate stroke of serendipity brought the two old friends together after years.',
        translation: '一次幸运的巧合让这两位老朋友在多年后重逢。',
        highlightWord: 'serendipity',
      },
      {
        sentence: 'The discovery was pure serendipity.',
        translation: '这个发现纯属意外之喜。',
        highlightWord: 'serendipity',
      },
      {
        sentence: 'Some of the best discoveries in science have been made by serendipity.',
        translation: '科学中一些最好的发现都是偶然得来的。',
        highlightWord: 'serendipity',
      },
    ],
    associations: [],
    generatedAt: new Date('2024-01-15'),
  };

  // Example 2: Word with multiple parts of speech
  const multiplePartsWord: Word = {
    id: 'word-2',
    word: 'book',
    phonetic: '/bʊk/',
    definitions: [
      {
        partOfSpeech: 'noun',
        meaningCN: '书；书籍',
        meaningEN: 'a written or printed work consisting of pages glued or sewn together along one side and bound in covers',
      },
      {
        partOfSpeech: 'verb',
        meaningCN: '预订；预约',
        meaningEN: 'to arrange for someone to have a seat on a plane, a room in a hotel, etc.',
      },
    ],
    examples: [
      {
        sentence: 'I love reading books in my free time.',
        translation: '我喜欢在空闲时间读书。',
        highlightWord: 'books',
      },
      {
        sentence: 'Please book a table for two at 7 PM.',
        translation: '请预订晚上7点的两人桌。',
        highlightWord: 'book',
      },
      {
        sentence: 'This book changed my perspective on life.',
        translation: '这本书改变了我对生活的看法。',
        highlightWord: 'book',
      },
      {
        sentence: 'I need to book a flight to New York.',
        translation: '我需要预订去纽约的航班。',
        highlightWord: 'book',
      },
    ],
    associations: [],
    generatedAt: new Date('2024-01-16'),
  };

  // Example 3: Word without phonetic
  const wordWithoutPhonetic: Word = {
    id: 'word-3',
    word: 'hello',
    definitions: [
      {
        partOfSpeech: 'interjection',
        meaningCN: '你好；喂',
        meaningEN: 'used as a greeting or to begin a phone conversation',
      },
    ],
    examples: [
      {
        sentence: 'Hello! How are you today?',
        translation: '你好！你今天怎么样？',
        highlightWord: 'Hello',
      },
      {
        sentence: 'She said hello to everyone in the room.',
        translation: '她向房间里的每个人打招呼。',
        highlightWord: 'hello',
      },
    ],
    associations: [],
    generatedAt: new Date('2024-01-17'),
  };

  // Example 4: Word with many examples
  const wordWithManyExamples: Word = {
    id: 'word-4',
    word: 'run',
    phonetic: '/rʌn/',
    definitions: [
      {
        partOfSpeech: 'verb',
        meaningCN: '跑；奔跑',
        meaningEN: 'to move at a speed faster than a walk, never having both or all the feet on the ground at the same time',
      },
      {
        partOfSpeech: 'noun',
        meaningCN: '跑步；奔跑',
        meaningEN: 'an act or spell of running',
      },
    ],
    examples: [
      {
        sentence: 'I run every morning to stay healthy.',
        translation: '我每天早上跑步以保持健康。',
        highlightWord: 'run',
      },
      {
        sentence: 'The children ran across the playground.',
        translation: '孩子们跑过操场。',
        highlightWord: 'ran',
      },
      {
        sentence: 'She runs a successful business.',
        translation: '她经营着一家成功的企业。',
        highlightWord: 'runs',
      },
      {
        sentence: 'The program runs on all operating systems.',
        translation: '该程序在所有操作系统上运行。',
        highlightWord: 'runs',
      },
      {
        sentence: 'I went for a run in the park.',
        translation: '我去公园跑步了。',
        highlightWord: 'run',
      },
      {
        sentence: 'The play had a successful run on Broadway.',
        translation: '这部戏在百老汇成功上演。',
        highlightWord: 'run',
      },
      {
        sentence: 'Time is running out.',
        translation: '时间不多了。',
        highlightWord: 'running',
      },
      {
        sentence: 'The river runs through the valley.',
        translation: '河流穿过山谷。',
        highlightWord: 'runs',
      },
      {
        sentence: 'My nose is running.',
        translation: '我流鼻涕了。',
        highlightWord: 'running',
      },
      {
        sentence: 'The car runs smoothly.',
        translation: '这辆车运行平稳。',
        highlightWord: 'runs',
      },
    ],
    associations: [],
    generatedAt: new Date('2024-01-18'),
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          WordCard Component Examples
        </h1>

        {/* Example 1 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Example 1: Complete Word Information
          </h2>
          <p className="text-gray-600 mb-4">
            A word with all information including phonetic notation, definition, and examples.
          </p>
          <WordCard word={completeWord} />
        </section>

        {/* Example 2 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Example 2: Multiple Parts of Speech
          </h2>
          <p className="text-gray-600 mb-4">
            A word that can be used as different parts of speech (noun and verb).
          </p>
          <WordCard word={multiplePartsWord} />
        </section>

        {/* Example 3 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Example 3: Word Without Phonetic
          </h2>
          <p className="text-gray-600 mb-4">
            A word without phonetic notation (still displays correctly).
          </p>
          <WordCard word={wordWithoutPhonetic} />
        </section>

        {/* Example 4 */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Example 4: Word With Many Examples
          </h2>
          <p className="text-gray-600 mb-4">
            A word with multiple definitions and many example sentences.
          </p>
          <WordCard word={wordWithManyExamples} />
        </section>

        {/* Example 5: Custom styling */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Example 5: Custom Styling
          </h2>
          <p className="text-gray-600 mb-4">
            WordCard with custom className for additional styling.
          </p>
          <WordCard 
            word={completeWord} 
            className="border-4 border-blue-300"
          />
        </section>

        {/* Responsive Demo */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Responsive Layout Demo
          </h2>
          <p className="text-gray-600 mb-4">
            Resize your browser window to see how the layout adapts to different screen sizes.
            On mobile, the word and phonetic stack vertically. On desktop, they appear side by side.
          </p>
          <WordCard word={multiplePartsWord} />
        </section>
      </div>
    </div>
  );
}

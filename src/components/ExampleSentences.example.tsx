/**
 * ExampleSentences Component Examples
 * 
 * Demonstrates usage of the ExampleSentences component
 */

import { ExampleSentences } from './ExampleSentences';
import { ExampleSentence } from '../types/word';
import { EnhancedExampleSentence } from '../services/enhanced/types';

export function ExampleSentencesExamples() {
  // Example 1: Basic usage with a few sentences
  const basicExamples: ExampleSentence[] = [
    {
      sentence: 'I love reading books.',
      translation: '我喜欢读书。',
      highlightWord: 'books',
    },
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
  ];

  // Example 2: Different parts of speech (noun vs verb)
  const multiplePartsOfSpeech: ExampleSentence[] = [
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
    {
      sentence: 'I need to book a flight to Paris.',
      translation: '我需要预订去巴黎的航班。',
      highlightWord: 'book',
    },
  ];

  // Example 3: Case-insensitive highlighting
  const caseInsensitiveExamples: ExampleSentence[] = [
    {
      sentence: 'Quick thinking saved the day.',
      translation: '快速思考拯救了这一天。',
      highlightWord: 'quick',
    },
    {
      sentence: 'The quick brown fox jumps over the lazy dog.',
      translation: '敏捷的棕色狐狸跳过懒狗。',
      highlightWord: 'quick',
    },
  ];

  // Example 4: Multiple occurrences
  const multipleOccurrences: ExampleSentence[] = [
    {
      sentence: 'The book on the table is a good book.',
      translation: '桌子上的书是一本好书。',
      highlightWord: 'book',
    },
  ];

  // Example 5: Enhanced examples with context grouping
  const enhancedExamples: EnhancedExampleSentence[] = [
    {
      sentence: 'Let\'s grab coffee later.',
      translation: '我们待会儿去喝咖啡吧。',
      highlightWord: 'coffee',
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
      sentence: 'Good morning! How are you?',
      translation: '早上好！你好吗？',
      highlightWord: 'morning',
      context: 'daily-conversation',
      diversityScore: 0.80,
      naturalnessScore: 0.95,
      metadata: {
        generatedAt: new Date(),
        model: 'gpt-4',
        tokensUsed: 40,
      },
    },
    {
      sentence: 'The quarterly report shows significant growth.',
      translation: '季度报告显示显著增长。',
      highlightWord: 'report',
      context: 'business-communication',
      diversityScore: 0.75,
      naturalnessScore: 0.85,
      metadata: {
        generatedAt: new Date(),
        model: 'gpt-4',
        tokensUsed: 60,
      },
    },
    {
      sentence: 'Please schedule a meeting for next week.',
      translation: '请安排下周的会议。',
      highlightWord: 'meeting',
      context: 'business-communication',
      diversityScore: 0.70,
      naturalnessScore: 0.88,
      metadata: {
        generatedAt: new Date(),
        model: 'gpt-4',
        tokensUsed: 55,
      },
    },
    {
      sentence: 'The research methodology is well-documented.',
      translation: '研究方法有详细记录。',
      highlightWord: 'research',
      context: 'academic-writing',
      diversityScore: 0.82,
      naturalnessScore: 0.87,
      metadata: {
        generatedAt: new Date(),
        model: 'gpt-4',
        tokensUsed: 65,
      },
    },
  ];

  return (
    <div className="space-y-8 p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        ExampleSentences Component Examples
      </h1>

      {/* Example 1 */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 1: Basic Usage
        </h2>
        <p className="text-gray-600 mb-4">
          Displaying multiple example sentences with highlighted target word.
        </p>
        <ExampleSentences examples={basicExamples} />
      </section>

      {/* Example 2 */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 2: Different Parts of Speech
        </h2>
        <p className="text-gray-600 mb-4">
          The same word "book" used as both a noun and a verb.
        </p>
        <ExampleSentences examples={multiplePartsOfSpeech} />
      </section>

      {/* Example 3 */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 3: Case-Insensitive Highlighting
        </h2>
        <p className="text-gray-600 mb-4">
          Highlighting works regardless of capitalization.
        </p>
        <ExampleSentences examples={caseInsensitiveExamples} />
      </section>

      {/* Example 4 */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 4: Multiple Occurrences
        </h2>
        <p className="text-gray-600 mb-4">
          All occurrences of the target word are highlighted.
        </p>
        <ExampleSentences examples={multipleOccurrences} />
      </section>

      {/* Example 5: Empty state */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 5: Empty State
        </h2>
        <p className="text-gray-600 mb-4">
          When no examples are provided, a friendly message is displayed.
        </p>
        <ExampleSentences examples={[]} />
      </section>

      {/* Example 6: Enhanced examples with context grouping */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 6: Context Grouping (Enhanced)
        </h2>
        <p className="text-gray-600 mb-4">
          Enhanced examples grouped by application context with Chinese labels and color coding.
        </p>
        <ExampleSentences examples={enhancedExamples} groupByContext={true} />
      </section>

      {/* Example 7: Enhanced examples with quality indicators */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 7: Quality Indicators
        </h2>
        <p className="text-gray-600 mb-4">
          Enhanced examples with diversity and naturalness scores displayed.
        </p>
        <ExampleSentences 
          examples={enhancedExamples} 
          groupByContext={true}
          showQualityIndicators={true}
        />
      </section>

      {/* Example 8: Context filtering */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 8: Context Filtering
        </h2>
        <p className="text-gray-600 mb-4">
          Showing only daily conversation and business communication contexts.
        </p>
        <ExampleSentences 
          examples={enhancedExamples} 
          groupByContext={true}
          filterContexts={['daily-conversation', 'business-communication']}
        />
      </section>

      {/* Example 9: Custom className */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Example 9: Custom Styling
        </h2>
        <p className="text-gray-600 mb-4">
          Component with custom className for additional styling.
        </p>
        <ExampleSentences 
          examples={basicExamples.slice(0, 2)} 
          className="border-2 border-blue-300 p-4 rounded-lg"
        />
      </section>
    </div>
  );
}

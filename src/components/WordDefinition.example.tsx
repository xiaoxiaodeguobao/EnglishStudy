/**
 * WordDefinition Component Example
 * 
 * Demonstrates usage of the WordDefinition component
 */

import { WordDefinition } from './WordDefinition';
import { WordDefinition as WordDefinitionType } from '../types/word';

export function WordDefinitionExample() {
  // Example 1: Single definition
  const singleDefinition: WordDefinitionType[] = [
    {
      partOfSpeech: 'noun',
      meaningCN: '书；书籍',
      meaningEN: 'a written or printed work consisting of pages glued or sewn together along one side and bound in covers',
    },
  ];

  // Example 2: Multiple definitions (different parts of speech)
  const multipleDefinitions: WordDefinitionType[] = [
    {
      partOfSpeech: 'noun',
      meaningCN: '书；书籍',
      meaningEN: 'a written or printed work consisting of pages',
    },
    {
      partOfSpeech: 'verb',
      meaningCN: '预订；预约',
      meaningEN: 'to arrange for someone to have a seat on a plane, a room in a hotel, etc.',
    },
    {
      partOfSpeech: 'adjective',
      meaningCN: '账面上的；书本上的',
      meaningEN: 'relating to or contained in books',
    },
  ];

  // Example 3: Empty definitions
  const emptyDefinitions: WordDefinitionType[] = [];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">Example 1: Single Definition</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">book</h3>
          <WordDefinition definitions={singleDefinition} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Example 2: Multiple Definitions</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">book</h3>
          <WordDefinition definitions={multipleDefinitions} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Example 3: Empty Definitions</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">unknown-word</h3>
          <WordDefinition definitions={emptyDefinitions} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Example 4: With Custom Styling</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">fast</h3>
          <WordDefinition
            definitions={[
              {
                partOfSpeech: 'adjective',
                meaningCN: '快速的；迅速的',
                meaningEN: 'moving or capable of moving at high speed',
              },
              {
                partOfSpeech: 'adverb',
                meaningCN: '快速地；迅速地',
                meaningEN: 'at high speed',
              },
            ]}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

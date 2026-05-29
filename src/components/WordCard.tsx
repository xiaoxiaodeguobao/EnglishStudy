/**
 * WordCard Component
 * 
 * Integrates WordDefinition and ExampleSentences to display complete word information
 * including the word itself, phonetic notation, definitions, and example sentences.
 * Implements responsive layout for mobile and desktop.
 * Optimized with React.memo for performance in large lists.
 * 
 * Enhanced features:
 * - Context filtering for examples
 * - Quality indicator toggle
 * - AI-generated enhanced examples with context awareness
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.6, 7.1, 7.4, 11.3, 8.1, 8.2, 8.3, 8.6
 */

import React from 'react';
import { Word } from '../types/word';
import { WordDefinition } from './WordDefinition';
import { ExampleSentences } from './ExampleSentences';

export interface WordCardProps {
  /** The word object containing all information to display */
  word: Word;
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * WordCard component displays complete word information in a card layout
 * with responsive design for mobile and desktop devices
 * 
 * Memoized to prevent unnecessary re-renders when used in large lists
 */
export const WordCard = React.memo(function WordCard({ word, className = '' }: WordCardProps) {
  // Use examples already generated with the word (from the main word generation flow)
  // No need to call AI again — examples are included in word.examples
  const examplesToDisplay = word.examples;
  
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden
        ${className}
      `}
    >
      {/* Word Header Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
          {/* Word */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-0">
            {word.word}
          </h2>
          
          {/* Phonetic */}
          {word.phonetic && (
            <span className="text-lg sm:text-xl text-blue-100 font-light">
              {word.phonetic}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Definitions Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="inline-block w-1 h-6 bg-blue-500 mr-3 rounded"></span>
            释义
          </h3>
          <WordDefinition definitions={word.definitions} />
        </section>

        {/* Example Sentences Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="inline-block w-1 h-6 bg-blue-500 mr-3 rounded"></span>
              例句
            </h3>
          </div>
          
          {examplesToDisplay && examplesToDisplay.length > 0 ? (
            <ExampleSentences
              examples={examplesToDisplay}
              groupByContext={false}
              showQualityIndicators={false}
            />
          ) : (
            <p className="text-gray-500 text-sm italic">暂无例句</p>
          )}
        </section>
      </div>
    </div>
  );
});

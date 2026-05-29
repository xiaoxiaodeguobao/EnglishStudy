/**
 * WordDefinition Component
 * 
 * Displays word definitions with part of speech, Chinese and English meanings
 * in a structured format. Handles multiple definitions for different parts of speech.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { WordDefinition as WordDefinitionType } from '../types/word';

export interface WordDefinitionProps {
  /** Array of word definitions to display */
  definitions: WordDefinitionType[];
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * WordDefinition component displays structured word definitions
 * with part of speech labels and bilingual meanings
 */
export function WordDefinition({ definitions, className = '' }: WordDefinitionProps) {
  if (!definitions || definitions.length === 0) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        暂无释义
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {definitions.map((definition, index) => (
        <div
          key={index}
          className="border-l-4 border-blue-500 pl-4 py-2"
        >
          {/* Part of Speech */}
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
              {definition.partOfSpeech}
            </span>
          </div>

          {/* Chinese Meaning */}
          <div className="mb-2">
            <p className="text-base text-gray-900 leading-relaxed">
              {definition.meaningCN}
            </p>
          </div>

          {/* English Meaning */}
          <div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {definition.meaningEN}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

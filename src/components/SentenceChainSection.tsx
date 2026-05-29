/**
 * SentenceChainSection Component
 * 
 * Displays sentence chains that use multiple words from the daily word list.
 * Each sentence chain highlights the words used and shows the Chinese translation.
 * Handles empty states gracefully.
 * Supports enhanced sentence chains with context labels and filtering.
 * Requirements: 5.1, 5.2, 5.3, 8.4, 8.5, 8.6
 */

import React from 'react';
import { SentenceChain } from '../types/wordList';
import { Word } from '../types/word';
import { EnhancedSentenceChain } from '../services/enhanced/types';
import { ApplicationContext } from '../services/ai/types';
import { ContextLabels, ContextColors } from '../types/context';

export interface SentenceChainSectionProps {
  /** Array of sentence chains to display (supports both regular and enhanced) */
  sentenceChains: SentenceChain[] | EnhancedSentenceChain[];
  /** Array of words to enable word highlighting */
  words: Word[];
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Whether to show context labels (default: true) - Requirement 8.4 */
  showContextLabels?: boolean;
  /** Filter by specific contexts - Requirement 8.6 */
  filterContexts?: ApplicationContext[];
}

/**
 * Type guard to check if a sentence chain is enhanced
 */
function isEnhancedSentenceChain(chain: SentenceChain | EnhancedSentenceChain): chain is EnhancedSentenceChain {
  return 'context' in chain && 'qualityScore' in chain;
}

/**
 * Highlights multiple words in a sentence with different colors (case-insensitive)
 * Returns an array of text segments with highlighted portions marked
 * Requirement 8.5: Multi-color word highlighting
 */
function highlightMultipleWords(
  sentence: string,
  wordsToHighlight: Array<{ word: string; color: string }>
): React.ReactNode[] {
  if (!wordsToHighlight || wordsToHighlight.length === 0 || !sentence) {
    return [sentence];
  }

  // Create a case-insensitive regex that matches any of the words
  // Use word boundaries to avoid partial matches
  const escapedWords = wordsToHighlight.map(({ word }) => 
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let matchIndex = 0;

  // Find all matches and split the sentence
  while ((match = regex.exec(sentence)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(sentence.substring(lastIndex, match.index));
    }

    // Find the color for this word
    const matchedWord = wordsToHighlight.find(
      ({ word }) => word.toLowerCase() === match![0].toLowerCase()
    );
    const color = matchedWord?.color || 'blue';

    // Add the highlighted match with appropriate color
    parts.push(
      <mark
        key={`${match.index}-${matchIndex++}`}
        className={`bg-${color}-200 text-gray-900 font-semibold px-1 rounded`}
      >
        {match[0]}
      </mark>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last match
  if (lastIndex < sentence.length) {
    parts.push(sentence.substring(lastIndex));
  }

  // If no matches found, return the original sentence
  return parts.length > 0 ? parts : [sentence];
}

/**
 * SentenceChainSection component displays a list of sentence chains
 * with highlighted words and Chinese translations
 */
export function SentenceChainSection({ 
  sentenceChains, 
  words, 
  className = '',
  showContextLabels = true,
  filterContexts,
}: SentenceChainSectionProps) {
  // Filter by context if specified - Requirement 8.6
  const filteredChains = filterContexts
    ? sentenceChains.filter(chain => 
        isEnhancedSentenceChain(chain) && filterContexts.includes(chain.context)
      )
    : sentenceChains;

  // Empty state
  if (!filteredChains || filteredChains.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 border border-gray-200 ${className}`}>
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <p className="text-gray-600">暂无句子链</p>
        </div>
      </div>
    );
  }

  // Create a map of word IDs to word strings and colors for highlighting
  // Requirement 8.5: Assign different colors to each word (blue, green, purple, orange, pink)
  const wordMap = new Map<string, { word: string; color: string }>();
  const colors = ['blue', 'green', 'purple', 'orange', 'pink'];
  
  words.forEach((word, index) => {
    wordMap.set(word.id, {
      word: word.word,
      color: colors[index % colors.length],
    });
  });

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="inline-block w-1 h-6 bg-green-500 mr-3 rounded"></span>
          连锁造句
        </h3>
        <p className="text-sm text-gray-600 mt-2 ml-4">
          使用今日单词构成的句子示例
        </p>
      </div>

      {/* Sentence Chains List */}
      <div className="space-y-4">
        {filteredChains.map((chain, index) => {
          // Get the actual words to highlight with their colors
          const wordsToHighlight = chain.usedWordIds
            .map(id => wordMap.get(id))
            .filter((item): item is { word: string; color: string } => item !== undefined);

          // Check if this is an enhanced chain with context
          const isEnhanced = isEnhancedSentenceChain(chain);
          const context = isEnhanced ? chain.context : undefined;

          return (
            <div
              key={chain.id}
              className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              {/* Chain Number Badge */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {index + 1}
                </span>

                <div className="flex-1">
                  {/* Context Label - Requirement 8.4 */}
                  {showContextLabels && context && (
                    <div className="mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${ContextColors[context]}`}
                      >
                        {ContextLabels[context]}
                      </span>
                    </div>
                  )}

                  {/* English Sentence with Multi-Color Highlighting - Requirement 8.5 */}
                  <div className="mb-3">
                    <p className="text-base text-gray-900 leading-relaxed">
                      {highlightMultipleWords(chain.sentence, wordsToHighlight)}
                    </p>
                  </div>

                  {/* Chinese Translation */}
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {chain.translation}
                    </p>
                  </div>

                  {/* Used Words Count and Quality Score - Requirement 8.5 */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span>使用了 {chain.usedWordIds.length} 个单词</span>
                    {isEnhanced && chain.qualityScore !== undefined && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>质量: {Math.round(chain.qualityScore * 100)}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

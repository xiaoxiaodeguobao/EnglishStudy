/**
 * WordList Component
 * 
 * Displays a list of words using the WordCard component.
 * Handles empty states and loading states.
 * 
 * Performance Optimization:
 * - Lists ≤50 words: Regular rendering (typical use case: 10-100 words/day)
 * - Lists >50 words: Virtual scrolling with @tanstack/react-virtual
 * - Estimated item size: 400px per WordCard
 * - Overscan: 2 items for smooth scrolling
 * 
 * This threshold (50 words) is optimized for the typical daily learning scenario
 * where users learn 10-100 words per day. Regular rendering is used for smaller
 * lists to avoid virtual scrolling overhead, while large lists benefit from
 * virtualization to maintain smooth performance.
 * 
 * Requirements: 3.2, 11.3
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Word } from '../types/word';
import { WordCard } from './WordCard';
import { Loader2 } from 'lucide-react';

export interface WordListProps {
  /** Array of words to display */
  words: Word[];
  /** Whether the list is currently loading */
  loading?: boolean;
  /** Optional CSS class name for custom styling */
  className?: string;
}

// Threshold for enabling virtual scrolling
const VIRTUAL_SCROLL_THRESHOLD = 50;

/**
 * WordList component displays a list of word cards with loading and empty states.
 * Automatically enables virtual scrolling for lists with more than 50 words.
 */
export function WordList({ words, loading = false, className = '' }: WordListProps) {
  // Loading state
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" aria-hidden="true" />
        <p className="text-gray-600 text-lg">加载单词中...</p>
      </div>
    );
  }

  // Empty state
  if (!words || words.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无单词</h3>
          <p className="text-gray-600">
            当前没有可显示的单词。请生成新的单词列表或选择其他日期。
          </p>
        </div>
      </div>
    );
  }

  // Determine if we should use virtual scrolling
  const useVirtualScroll = words.length > VIRTUAL_SCROLL_THRESHOLD;

  // Render with virtual scrolling for large lists
  if (useVirtualScroll) {
    return <VirtualWordList words={words} className={className} />;
  }

  // Regular rendering for small lists
  return (
    <div className={`space-y-6 ${className}`}>
      {words.map((word) => (
        <WordCard key={word.id} word={word} />
      ))}
    </div>
  );
}

/**
 * VirtualWordList component uses virtual scrolling for large word lists
 * to optimize rendering performance
 */
function VirtualWordList({ words, className = '' }: { words: Word[]; className?: string }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: words.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated height of a WordCard in pixels
    overscan: 2, // Number of items to render outside visible area
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100vh', maxHeight: 'calc(100vh - 200px)' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            className="pb-6"
          >
            <WordCard word={words[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

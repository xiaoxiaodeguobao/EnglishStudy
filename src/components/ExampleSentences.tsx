/**
 * ExampleSentences Component
 * 
 * Displays a list of example sentences with the target word highlighted
 * and Chinese translations. Handles case-insensitive word highlighting.
 * Supports enhanced features like context grouping and quality indicators.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.6
 */

import { ExampleSentence } from '../types/word';
import { EnhancedExampleSentence } from '../services/enhanced/types';
import { ApplicationContext, ContextLabels, ContextColors } from '../types/context';

export interface ExampleSentencesProps {
  /** Array of example sentences to display (supports both basic and enhanced) */
  examples: ExampleSentence[] | EnhancedExampleSentence[];
  /** Optional CSS class name for custom styling */
  className?: string;
  /** Group examples by application context (default: true) */
  groupByContext?: boolean;
  /** Show quality indicators (diversity/naturalness scores) (default: false) */
  showQualityIndicators?: boolean;
  /** Filter to show only specific contexts (optional) */
  filterContexts?: ApplicationContext[];
}

/**
 * Type guard to check if an example is enhanced
 */
function isEnhancedExample(example: ExampleSentence | EnhancedExampleSentence): example is EnhancedExampleSentence {
  return 'context' in example && 'metadata' in example;
}

/**
 * Highlights the target word in a sentence (case-insensitive)
 * Returns an array of text segments with highlighted portions marked
 */
function highlightWord(sentence: string, targetWord: string): React.ReactNode[] {
  if (!targetWord || !sentence) {
    return [sentence];
  }

  // Create a case-insensitive regex that matches the whole word
  // Use word boundaries to avoid partial matches
  const regex = new RegExp(`\\b(${targetWord})\\b`, 'gi');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // Find all matches and split the sentence
  while ((match = regex.exec(sentence)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(sentence.substring(lastIndex, match.index));
    }

    // Add the highlighted match
    parts.push(
      <mark
        key={match.index}
        className="bg-yellow-200 text-gray-900 font-semibold px-1 rounded"
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
 * ExampleSentences component displays a list of example sentences
 * with highlighted target words and Chinese translations.
 * Supports context grouping and quality indicators for enhanced examples.
 */
export function ExampleSentences({ 
  examples, 
  className = '',
  groupByContext = true,
  showQualityIndicators = false,
  filterContexts,
}: ExampleSentencesProps) {
  if (!examples || examples.length === 0) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        暂无例句
      </div>
    );
  }

  // Filter examples by context if specified
  let filteredExamples = examples;
  if (filterContexts && filterContexts.length > 0) {
    filteredExamples = examples.filter(ex => 
      isEnhancedExample(ex) && filterContexts.includes(ex.context)
    );
  }

  // Check if filtered examples is empty
  if (filteredExamples.length === 0) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        暂无例句
      </div>
    );
  }

  // Check if we have enhanced examples and should group by context
  const hasEnhancedExamples = filteredExamples.some(isEnhancedExample);
  const shouldGroup = groupByContext && hasEnhancedExamples;

  if (shouldGroup) {
    return renderGroupedExamples(filteredExamples as EnhancedExampleSentence[], className, showQualityIndicators);
  }

  return renderFlatExamples(filteredExamples, className, showQualityIndicators);
}

/**
 * Render examples grouped by application context
 */
function renderGroupedExamples(
  examples: EnhancedExampleSentence[], 
  className: string,
  showQualityIndicators: boolean
) {
  // Group examples by context
  const groupedByContext = examples.reduce((acc, example) => {
    const context = example.context;
    if (!acc[context]) {
      acc[context] = [];
    }
    acc[context].push(example);
    return acc;
  }, {} as Record<ApplicationContext, EnhancedExampleSentence[]>);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedByContext).map(([context, contextExamples]) => (
        <div key={context} className="space-y-3">
          {/* Context Label */}
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ContextColors[context as ApplicationContext]}`}>
              {ContextLabels[context as ApplicationContext]}
            </span>
            <span className="text-xs text-gray-500">
              ({contextExamples.length} 个例句)
            </span>
          </div>

          {/* Examples in this context */}
          <div className="space-y-4">
            {contextExamples.map((example, index) => (
              <ExampleCard 
                key={`${context}-${index}`}
                example={example}
                showQualityIndicators={showQualityIndicators}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Render examples in a flat list (no grouping)
 */
function renderFlatExamples(
  examples: (ExampleSentence | EnhancedExampleSentence)[], 
  className: string,
  showQualityIndicators: boolean
) {
  return (
    <div className={`space-y-4 ${className}`}>
      {examples.map((example, index) => (
        <ExampleCard 
          key={index}
          example={example}
          showQualityIndicators={showQualityIndicators}
        />
      ))}
    </div>
  );
}

/**
 * Individual example card component
 */
function ExampleCard({ 
  example, 
  showQualityIndicators 
}: { 
  example: ExampleSentence | EnhancedExampleSentence;
  showQualityIndicators: boolean;
}) {
  const isEnhanced = isEnhancedExample(example);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
      {/* Example Sentence with Highlighting */}
      <div className="mb-2">
        <p className="text-base text-gray-900 leading-relaxed">
          {highlightWord(example.sentence, example.highlightWord)}
        </p>
      </div>

      {/* Chinese Translation */}
      <div className="border-t border-gray-200 pt-2 mt-2">
        <p className="text-sm text-gray-600 leading-relaxed">
          {example.translation}
        </p>
      </div>

      {/* Quality Indicators (if enabled and available) */}
      {showQualityIndicators && isEnhanced && (
        <div className="border-t border-gray-200 pt-2 mt-2 flex items-center gap-4 text-xs text-gray-500">
          {example.diversityScore !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">多样性:</span>
              <span className={getScoreColor(example.diversityScore)}>
                {(example.diversityScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
          {example.naturalnessScore !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">自然度:</span>
              <span className={getScoreColor(example.naturalnessScore)}>
                {(example.naturalnessScore * 100).toFixed(0)}%
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-medium">长度:</span>
            <span className="text-gray-700">
              {example.sentence.split(/\s+/).length} 词
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get color class based on quality score
 */
function getScoreColor(score: number): string {
  if (score >= 0.8) return 'text-green-600 font-semibold';
  if (score >= 0.6) return 'text-yellow-600 font-semibold';
  return 'text-red-600 font-semibold';
}

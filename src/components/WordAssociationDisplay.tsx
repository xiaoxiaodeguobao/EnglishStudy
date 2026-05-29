/**
 * WordAssociationDisplay Component
 * 
 * Displays word associations between words in the daily word list.
 * Visualizes association types (theme, semantic, root, context) with
 * color-coded badges and descriptions.
 * Requirements: 4.2, 4.3, 4.4
 */

import { WordAssociation, AssociationType } from '../types/wordList';
import { Word } from '../types/word';

export interface WordAssociationDisplayProps {
  /** Array of word associations to display */
  associations: WordAssociation[];
  /** Array of words to look up word details by ID */
  words: Word[];
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * Get the display label for an association type
 */
function getAssociationTypeLabel(type: AssociationType): string {
  const labels: Record<AssociationType, string> = {
    theme: '主题关联',
    semantic: '语义关联',
    root: '词根关联',
    context: '场景关联',
  };
  return labels[type];
}

/**
 * Get the color classes for an association type badge
 */
function getAssociationTypeColor(type: AssociationType): string {
  const colors: Record<AssociationType, string> = {
    theme: 'bg-purple-100 text-purple-700 border-purple-300',
    semantic: 'bg-blue-100 text-blue-700 border-blue-300',
    root: 'bg-green-100 text-green-700 border-green-300',
    context: 'bg-orange-100 text-orange-700 border-orange-300',
  };
  return colors[type];
}

/**
 * Get the icon for an association type
 */
function getAssociationTypeIcon(type: AssociationType): string {
  const icons: Record<AssociationType, string> = {
    theme: '🎯',
    semantic: '💡',
    root: '🌱',
    context: '🎬',
  };
  return icons[type];
}

/**
 * Find a word by its ID
 */
function findWordById(words: Word[], wordId: string): Word | undefined {
  return words.find(w => w.id === wordId);
}

/**
 * WordAssociationDisplay component displays word associations
 * with visual indicators for association types
 */
export function WordAssociationDisplay({
  associations,
  words,
  className = '',
}: WordAssociationDisplayProps) {
  // Handle empty state
  if (!associations || associations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 text-5xl mb-3">🔗</div>
        <p className="text-gray-500 text-base">暂无单词关联</p>
        <p className="text-gray-400 text-sm mt-1">
          当有多个单词时，系统会自动识别它们之间的关联关系
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Association Count Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              发现 {associations.length} 个单词关联
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              这些关联可以帮助你更好地记忆和理解单词
            </p>
          </div>
        </div>
      </div>

      {/* Association List */}
      <div className="space-y-3">
        {associations.map((association, index) => {
          const word1 = findWordById(words, association.word1Id);
          const word2 = findWordById(words, association.word2Id);

          // Skip if words not found
          if (!word1 || !word2) {
            return null;
          }

          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              {/* Word Pair */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                  {word1.word}
                </span>
                <span className="text-gray-400">↔</span>
                <span className="text-lg font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                  {word2.word}
                </span>
              </div>

              {/* Association Type Badge */}
              <div className="mb-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-full ${getAssociationTypeColor(
                    association.associationType
                  )}`}
                >
                  <span>{getAssociationTypeIcon(association.associationType)}</span>
                  <span>{getAssociationTypeLabel(association.associationType)}</span>
                </span>
              </div>

              {/* Association Description */}
              <div className="text-sm text-gray-700 leading-relaxed">
                {association.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-semibold text-gray-700 mb-2">关联类型说明：</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span className="text-gray-600">
              <strong>主题关联：</strong>属于同一主题或领域
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span className="text-gray-600">
              <strong>语义关联：</strong>意思相近或相关
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🌱</span>
            <span className="text-gray-600">
              <strong>词根关联：</strong>共享相同的词根或词源
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎬</span>
            <span className="text-gray-600">
              <strong>场景关联：</strong>常在相同场景中使用
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ContextFilter Component
 * 
 * Provides UI controls for filtering examples and sentence chains by application context.
 * Displays all available contexts as toggleable filter buttons with context-specific colors.
 * Includes "Select All" and "Clear All" convenience buttons.
 * 
 * Requirements: 8.6
 */

import { ApplicationContext, ContextLabels, ContextColors } from '../types/context';

export interface ContextFilterProps {
  /** Available contexts to display as filter options */
  contexts: ApplicationContext[];
  /** Currently selected contexts */
  selectedContexts: ApplicationContext[];
  /** Callback when selection changes */
  onSelectionChange: (contexts: ApplicationContext[]) => void;
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * ContextFilter component provides filtering controls for application contexts.
 * Users can toggle individual contexts or use "Select All" / "Clear All" buttons.
 * Selected contexts are highlighted with context-specific colors.
 */
export function ContextFilter({
  contexts,
  selectedContexts,
  onSelectionChange,
  className = '',
}: ContextFilterProps) {
  /**
   * Toggle a single context on/off
   */
  const toggleContext = (context: ApplicationContext) => {
    if (selectedContexts.includes(context)) {
      // Remove context from selection
      onSelectionChange(selectedContexts.filter(c => c !== context));
    } else {
      // Add context to selection
      onSelectionChange([...selectedContexts, context]);
    }
  };

  /**
   * Select all available contexts
   */
  const selectAll = () => {
    onSelectionChange(contexts);
  };

  /**
   * Clear all selected contexts
   */
  const clearAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header with Select All / Clear All buttons */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">筛选场景</h4>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
            aria-label="选择所有场景"
          >
            全选
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium transition"
            aria-label="清除所有场景"
          >
            清除
          </button>
        </div>
      </div>

      {/* Context Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {contexts.map(context => {
          const isSelected = selectedContexts.includes(context);
          
          return (
            <button
              key={context}
              onClick={() => toggleContext(context)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition
                ${isSelected
                  ? `${ContextColors[context]} border-2 border-current`
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                }
              `}
              aria-label={`${isSelected ? '取消选择' : '选择'} ${ContextLabels[context]}`}
              aria-pressed={isSelected}
            >
              {ContextLabels[context]}
            </button>
          );
        })}
      </div>

      {/* Selection Count */}
      {selectedContexts.length > 0 && (
        <div className="text-xs text-gray-500">
          已选择 {selectedContexts.length} 个场景
        </div>
      )}
    </div>
  );
}

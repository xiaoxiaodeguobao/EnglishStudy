/**
 * ErrorMessage Component
 * 
 * Displays user-friendly error messages with retry functionality.
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { ErrorType } from '../types/error';

export interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Type of error for contextual styling and messaging */
  errorType?: ErrorType;
  /** Callback function when retry button is clicked */
  onRetry?: () => void;
  /** Optional additional details or suggestions */
  details?: string;
  /** Whether to show the retry button */
  showRetry?: boolean;
}

/**
 * Get user-friendly title based on error type
 */
function getErrorTitle(errorType?: ErrorType): string {
  switch (errorType) {
    case 'network':
      return '网络错误';
    case 'validation':
      return '输入错误';
    case 'storage':
      return '存储错误';
    case 'generation':
      return '生成错误';
    case 'data_integrity':
      return '数据错误';
    default:
      return '发生错误';
  }
}

/**
 * ErrorMessage component displays friendly error messages and provides retry functionality
 */
export function ErrorMessage({
  message,
  errorType,
  onRetry,
  details,
  showRetry = true,
}: ErrorMessageProps) {
  const title = getErrorTitle(errorType);
  const hasRetry = showRetry && onRetry;

  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-red-900 font-semibold mb-1">{title}</h3>
          <p className="text-red-800 mb-2">{message}</p>
          
          {details && (
            <p className="text-sm text-red-700 mb-3">{details}</p>
          )}
          
          {hasRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
              aria-label="重试操作"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>重试</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

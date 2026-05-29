/**
 * Retry Handler with Exponential Backoff
 * 
 * Provides higher-level retry logic for AI service operations.
 * This is separate from httpClient's network-level retries and handles
 * application-level retry scenarios (e.g., quality assessment failures).
 * 
 * **Validates: Requirements 6.6, 6.7**
 */

/**
 * Options for retry configuration
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Initial backoff delay in milliseconds */
  backoffMs: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Maximum backoff delay in milliseconds (default: 30000) */
  maxBackoffMs?: number;
  /** Function to determine if error is retryable */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Callback invoked before each retry attempt */
  onRetry?: (error: Error, attempt: number, delayMs: number) => void;
}

/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
  /** The successful result */
  value: T;
  /** Number of attempts made */
  attempts: number;
  /** Total time spent including delays */
  totalTimeMs: number;
}

/**
 * Error thrown when all retry attempts are exhausted
 */
export class RetryExhaustedError extends Error {
  /** Number of attempts made */
  attempts: number;
  /** The last error that caused the failure */
  lastError: Error;
  /** All errors encountered during retries */
  errors: Error[];

  constructor(attempts: number, lastError: Error, errors: Error[]) {
    super(`Retry exhausted after ${attempts} attempts: ${lastError.message}`);
    this.name = 'RetryExhaustedError';
    this.attempts = attempts;
    this.lastError = lastError;
    this.errors = errors;
  }
}

/**
 * Logger utility for retry operations
 */
class RetryLogger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(`[${new Date().toISOString()}] [RETRY] [INFO] ${message}`, context || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${new Date().toISOString()}] [RETRY] [WARN] ${message}`, context || '');
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [RETRY] [ERROR] ${message}`, context || '');
  }
}

/**
 * Default retry predicate - retries all errors
 */
function defaultShouldRetry(_error: Error, _attempt: number): boolean {
  return true;
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(
  baseDelayMs: number,
  attempt: number,
  multiplier: number,
  maxDelayMs: number
): number {
  const delay = baseDelayMs * Math.pow(multiplier, attempt - 1);
  return Math.min(delay, maxDelayMs);
}

/**
 * Delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 * 
 * This utility function wraps any async operation with configurable retry logic.
 * It implements exponential backoff to avoid overwhelming services during failures.
 * 
 * Requirement 6.6: Implement retry logic with exponential backoff
 * Requirement 6.7: Add comprehensive error logging for all AI service calls
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the result with retry metadata
 * @throws RetryExhaustedError when all retry attempts fail
 * 
 * @example
 * ```typescript
 * // Basic usage with default options
 * const result = await withRetry(
 *   async () => await aiService.generateExamples(request),
 *   { maxAttempts: 3, backoffMs: 1000 }
 * );
 * 
 * // Advanced usage with custom retry logic
 * const result = await withRetry(
 *   async () => await qualityCheck(examples),
 *   {
 *     maxAttempts: 5,
 *     backoffMs: 500,
 *     backoffMultiplier: 2,
 *     maxBackoffMs: 10000,
 *     shouldRetry: (error, attempt) => {
 *       // Only retry quality failures, not validation errors
 *       return error.name === 'QualityCheckError' && attempt < 5;
 *     },
 *     onRetry: (error, attempt, delayMs) => {
 *       console.log(`Retrying after ${delayMs}ms (attempt ${attempt})`);
 *     }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<RetryResult<T>> {
  const {
    maxAttempts,
    backoffMs,
    backoffMultiplier = 2,
    maxBackoffMs = 30000,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  // Validate options
  if (maxAttempts < 1) {
    throw new Error('maxAttempts must be at least 1');
  }
  if (backoffMs < 0) {
    throw new Error('backoffMs must be non-negative');
  }
  if (backoffMultiplier < 1) {
    throw new Error('backoffMultiplier must be at least 1');
  }

  const errors: Error[] = [];
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      RetryLogger.info('Executing operation', {
        attempt,
        maxAttempts,
      });

      const value = await fn();

      const totalTimeMs = Date.now() - startTime;

      RetryLogger.info('Operation succeeded', {
        attempt,
        totalTimeMs,
      });

      return {
        value,
        attempts: attempt,
        totalTimeMs,
      };
    } catch (error: any) {
      errors.push(error);

      RetryLogger.error('Operation failed', {
        attempt,
        maxAttempts,
        error: error.message,
        errorName: error.name,
      });

      // Check if we should retry
      const isLastAttempt = attempt === maxAttempts;
      const shouldRetryError = shouldRetry(error, attempt);

      if (isLastAttempt || !shouldRetryError) {
        const totalTimeMs = Date.now() - startTime;

        RetryLogger.error('Retry exhausted', {
          attempts: attempt,
          totalTimeMs,
          lastError: error.message,
        });

        throw new RetryExhaustedError(attempt, error, errors);
      }

      // Calculate backoff delay
      const delayMs = calculateBackoff(
        backoffMs,
        attempt,
        backoffMultiplier,
        maxBackoffMs
      );

      RetryLogger.warn('Retrying operation', {
        attempt,
        nextAttempt: attempt + 1,
        delayMs,
        error: error.message,
      });

      // Invoke retry callback if provided
      if (onRetry) {
        try {
          onRetry(error, attempt, delayMs);
        } catch (callbackError: any) {
          RetryLogger.warn('Retry callback failed', {
            error: callbackError.message,
          });
        }
      }

      // Wait before retrying
      await delay(delayMs);
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new RetryExhaustedError(
    maxAttempts,
    errors[errors.length - 1],
    errors
  );
}

/**
 * Create a retry wrapper function with preset options
 * 
 * This is useful for creating reusable retry configurations.
 * 
 * @param defaultOptions - Default retry options
 * @returns A function that wraps operations with the preset retry logic
 * 
 * @example
 * ```typescript
 * // Create a retry wrapper for AI operations
 * const retryAIOperation = createRetryWrapper({
 *   maxAttempts: 3,
 *   backoffMs: 1000,
 *   shouldRetry: (error) => error.name === 'AIServiceError'
 * });
 * 
 * // Use the wrapper
 * const result = await retryAIOperation(
 *   async () => await aiService.generateExamples(request)
 * );
 * ```
 */
export function createRetryWrapper(defaultOptions: RetryOptions) {
  return async function <T>(
    fn: () => Promise<T>,
    overrideOptions?: Partial<RetryOptions>
  ): Promise<RetryResult<T>> {
    const options = { ...defaultOptions, ...overrideOptions };
    return withRetry(fn, options);
  };
}

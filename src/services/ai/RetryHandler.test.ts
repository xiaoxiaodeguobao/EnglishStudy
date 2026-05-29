/**
 * Tests for RetryHandler
 * 
 * **Validates: Requirements 6.6, 6.7**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  createRetryWrapper,
  RetryExhaustedError,
  RetryOptions,
} from './RetryHandler';

describe('RetryHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.value).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.value).toBe('success');
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw RetryExhaustedError when all attempts fail', async () => {
      const error1 = new Error('Attempt 1 failed');
      const error2 = new Error('Attempt 2 failed');
      const error3 = new Error('Attempt 3 failed');

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockRejectedValueOnce(error3);

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(RetryExhaustedError);
      await expect(promise).rejects.toMatchObject({
        attempts: 3,
        lastError: error3,
        errors: [error1, error2, error3],
      });

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should implement exponential backoff', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
        backoffMultiplier: 2,
      });

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      // Wait for first backoff (1000ms)
      await vi.advanceTimersByTimeAsync(1000);
      expect(fn).toHaveBeenCalledTimes(2);

      // Wait for second backoff (2000ms = 1000 * 2^1)
      await vi.advanceTimersByTimeAsync(2000);
      expect(fn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result.value).toBe('success');
      expect(result.attempts).toBe(3);
    });

    it('should respect maxBackoffMs', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
        backoffMultiplier: 10,
        maxBackoffMs: 5000,
      });

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0);
      expect(fn).toHaveBeenCalledTimes(1);

      // Wait for first backoff (1000ms)
      await vi.advanceTimersByTimeAsync(1000);
      expect(fn).toHaveBeenCalledTimes(2);

      // Second backoff would be 10000ms, but capped at 5000ms
      await vi.advanceTimersByTimeAsync(5000);
      expect(fn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result.value).toBe('success');
    });

    it('should use custom shouldRetry predicate', async () => {
      class RetryableError extends Error {
        name = 'RetryableError';
      }
      class NonRetryableError extends Error {
        name = 'NonRetryableError';
      }

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new RetryableError('Retry this'))
        .mockRejectedValueOnce(new NonRetryableError('Do not retry'));

      const shouldRetry = vi.fn((error: Error) => {
        return error.name === 'RetryableError';
      });

      const promise = withRetry(fn, {
        maxAttempts: 5,
        backoffMs: 1000,
        shouldRetry,
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(RetryExhaustedError);
      await expect(promise).rejects.toMatchObject({
        attempts: 2,
      });

      expect(fn).toHaveBeenCalledTimes(2);
      expect(shouldRetry).toHaveBeenCalledTimes(2);
    });

    it('should invoke onRetry callback', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
        onRetry,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.value).toBe('success');
      expect(onRetry).toHaveBeenCalledTimes(2);

      // Check first retry callback
      expect(onRetry).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ message: 'Attempt 1' }),
        1,
        1000
      );

      // Check second retry callback
      expect(onRetry).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ message: 'Attempt 2' }),
        2,
        2000
      );
    });

    it('should handle onRetry callback errors gracefully', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValue('success');

      const onRetry = vi.fn(() => {
        throw new Error('Callback error');
      });

      const promise = withRetry(fn, {
        maxAttempts: 2,
        backoffMs: 1000,
        onRetry,
      });

      await vi.runAllTimersAsync();

      // Should not throw callback error, should continue retrying
      const result = await promise;
      expect(result.value).toBe('success');
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should validate maxAttempts', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await expect(
        withRetry(fn, {
          maxAttempts: 0,
          backoffMs: 1000,
        })
      ).rejects.toThrow('maxAttempts must be at least 1');

      await expect(
        withRetry(fn, {
          maxAttempts: -1,
          backoffMs: 1000,
        })
      ).rejects.toThrow('maxAttempts must be at least 1');
    });

    it('should validate backoffMs', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          backoffMs: -1,
        })
      ).rejects.toThrow('backoffMs must be non-negative');
    });

    it('should validate backoffMultiplier', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 0.5,
        })
      ).rejects.toThrow('backoffMultiplier must be at least 1');
    });

    it('should track total time including delays', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 2,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.totalTimeMs).toBeGreaterThanOrEqual(1000);
    });

    it('should work with single attempt (no retries)', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 1,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.value).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should fail immediately on single attempt', async () => {
      const error = new Error('Failed');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, {
        maxAttempts: 1,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(RetryExhaustedError);
      await expect(promise).rejects.toMatchObject({
        attempts: 1,
        lastError: error,
      });

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createRetryWrapper', () => {
    it('should create a reusable retry wrapper', async () => {
      const retryWrapper = createRetryWrapper({
        maxAttempts: 3,
        backoffMs: 1000,
      });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValue('success');

      const promise = retryWrapper(fn);

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.value).toBe('success');
      expect(result.attempts).toBe(2);
    });

    it('should allow overriding default options', async () => {
      const retryWrapper = createRetryWrapper({
        maxAttempts: 3,
        backoffMs: 1000,
      });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockRejectedValueOnce(new Error('Attempt 3'))
        .mockRejectedValueOnce(new Error('Attempt 4'))
        .mockResolvedValue('success');

      const promise = retryWrapper(fn, {
        maxAttempts: 5, // Override default
      });

      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.value).toBe('success');
      expect(result.attempts).toBe(5);
    });

    it('should preserve custom shouldRetry logic', async () => {
      class CustomError extends Error {
        name = 'CustomError';
      }

      const retryWrapper = createRetryWrapper({
        maxAttempts: 5,
        backoffMs: 1000,
        shouldRetry: (error) => error.name === 'CustomError',
      });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new CustomError('Retry'))
        .mockRejectedValueOnce(new Error('Stop'));

      const promise = retryWrapper(fn);

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(RetryExhaustedError);
      await expect(promise).rejects.toMatchObject({
        attempts: 2,
      });
    });
  });

  describe('RetryExhaustedError', () => {
    it('should contain all error information', async () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');

      const fn = vi
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockRejectedValueOnce(error3);

      const promise = withRetry(fn, {
        maxAttempts: 3,
        backoffMs: 1000,
      });

      await vi.runAllTimersAsync();

      try {
        await promise;
        expect.fail('Should have thrown RetryExhaustedError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(RetryExhaustedError);
        expect(error.name).toBe('RetryExhaustedError');
        expect(error.attempts).toBe(3);
        expect(error.lastError).toBe(error3);
        expect(error.errors).toEqual([error1, error2, error3]);
        expect(error.message).toContain('Retry exhausted after 3 attempts');
        expect(error.message).toContain('Error 3');
      }
    });
  });
});

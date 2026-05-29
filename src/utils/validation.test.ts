/**
 * Unit Tests for Validation Utilities
 * 
 * Tests validation functions for learning plan parameters.
 * Requirements: 1.4, 1.5
 */

import { describe, it, expect } from 'vitest';
import { validateDaysCount, validateWordsPerDay } from './validation';

describe('validateDaysCount', () => {
  describe('valid inputs', () => {
    it('should accept 1 (minimum valid value)', () => {
      const result = validateDaysCount(1);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept 365 (maximum valid value)', () => {
      const result = validateDaysCount(365);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept values in the middle of the range', () => {
      const result = validateDaysCount(180);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept 30 (common use case)', () => {
      const result = validateDaysCount(30);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid inputs - out of range', () => {
    it('should reject 0 (below minimum)', () => {
      const result = validateDaysCount(0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须在1到365之间');
    });

    it('should reject negative numbers', () => {
      const result = validateDaysCount(-5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须在1到365之间');
    });

    it('should reject 366 (above maximum)', () => {
      const result = validateDaysCount(366);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须在1到365之间');
    });

    it('should reject very large numbers', () => {
      const result = validateDaysCount(1000);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须在1到365之间');
    });
  });

  describe('invalid inputs - non-integers', () => {
    it('should reject decimal numbers', () => {
      const result = validateDaysCount(30.5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须是整数');
    });

    it('should reject floating point numbers', () => {
      const result = validateDaysCount(100.99);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须是整数');
    });
  });

  describe('invalid inputs - non-numbers', () => {
    it('should reject NaN', () => {
      const result = validateDaysCount(NaN);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须是一个数字');
    });

    it('should reject string numbers', () => {
      const result = validateDaysCount('30' as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须是一个数字');
    });

    it('should reject null', () => {
      const result = validateDaysCount(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须是一个数字');
    });

    it('should reject undefined', () => {
      const result = validateDaysCount(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('学习天数必须是一个数字');
    });
  });
});

describe('validateWordsPerDay', () => {
  describe('valid inputs', () => {
    it('should accept 1 (minimum valid value)', () => {
      const result = validateWordsPerDay(1);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept 100 (maximum valid value)', () => {
      const result = validateWordsPerDay(100);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept values in the middle of the range', () => {
      const result = validateWordsPerDay(50);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept 10 (common use case)', () => {
      const result = validateWordsPerDay(10);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid inputs - out of range', () => {
    it('should reject 0 (below minimum)', () => {
      const result = validateWordsPerDay(0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须在1到100之间');
    });

    it('should reject negative numbers', () => {
      const result = validateWordsPerDay(-10);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须在1到100之间');
    });

    it('should reject 101 (above maximum)', () => {
      const result = validateWordsPerDay(101);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须在1到100之间');
    });

    it('should reject very large numbers', () => {
      const result = validateWordsPerDay(500);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须在1到100之间');
    });
  });

  describe('invalid inputs - non-integers', () => {
    it('should reject decimal numbers', () => {
      const result = validateWordsPerDay(10.5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须是整数');
    });

    it('should reject floating point numbers', () => {
      const result = validateWordsPerDay(25.99);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须是整数');
    });
  });

  describe('invalid inputs - non-numbers', () => {
    it('should reject NaN', () => {
      const result = validateWordsPerDay(NaN);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须是一个数字');
    });

    it('should reject string numbers', () => {
      const result = validateWordsPerDay('10' as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须是一个数字');
    });

    it('should reject null', () => {
      const result = validateWordsPerDay(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须是一个数字');
    });

    it('should reject undefined', () => {
      const result = validateWordsPerDay(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('每天学习单词数量必须是一个数字');
    });
  });
});

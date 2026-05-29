/**
 * Validation Utilities
 * 
 * Provides validation functions for learning plan parameters.
 * Requirements: 1.4, 1.5
 */

import type { LearningPlanValidation } from '../types/learningPlan';

/**
 * Validates that the days count is within the valid range (1-365).
 * 
 * @param daysCount - The number of days to validate
 * @returns Validation result with valid flag and error messages
 * 
 * Requirement 1.4: THE Vocabulary_Learning_App SHALL 验证学习天数为1到365之间的正整数
 */
export function validateDaysCount(daysCount: number): LearningPlanValidation {
  const errors: string[] = [];

  // Check if it's a number
  if (typeof daysCount !== 'number' || isNaN(daysCount)) {
    errors.push('学习天数必须是一个数字');
    return { valid: false, errors };
  }

  // Check if it's an integer
  if (!Number.isInteger(daysCount)) {
    errors.push('学习天数必须是整数');
    return { valid: false, errors };
  }

  // Check if it's within the valid range (1-365)
  if (daysCount < 1 || daysCount > 365) {
    errors.push('学习天数必须在1到365之间');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Validates that the words per day count is within the valid range (1-100).
 * 
 * @param wordsPerDay - The number of words per day to validate
 * @returns Validation result with valid flag and error messages
 * 
 * Requirement 1.5: THE Vocabulary_Learning_App SHALL 验证每天学习单词数量为1到100之间的正整数
 */
export function validateWordsPerDay(wordsPerDay: number): LearningPlanValidation {
  const errors: string[] = [];

  // Check if it's a number
  if (typeof wordsPerDay !== 'number' || isNaN(wordsPerDay)) {
    errors.push('每天学习单词数量必须是一个数字');
    return { valid: false, errors };
  }

  // Check if it's an integer
  if (!Number.isInteger(wordsPerDay)) {
    errors.push('每天学习单词数量必须是整数');
    return { valid: false, errors };
  }

  // Check if it's within the valid range (1-100)
  if (wordsPerDay < 1 || wordsPerDay > 100) {
    errors.push('每天学习单词数量必须在1到100之间');
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

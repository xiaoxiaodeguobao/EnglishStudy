/**
 * Unit Tests for ExampleSentenceService
 * 
 * Tests the example sentence service implementation.
 * Requirements: 7.1, 7.2, 7.4, 12.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExampleSentenceServiceImpl } from './ExampleSentenceService';
import type { ExampleSentence } from '../types';

describe('ExampleSentenceService', () => {
  let service: ExampleSentenceServiceImpl;

  beforeEach(() => {
    service = new ExampleSentenceServiceImpl();
  });

  describe('getExamples', () => {
    it('should generate the requested number of examples', async () => {
      // Requirement 7.1
      const examples = await service.getExamples('test', 10);

      expect(examples).toHaveLength(10);
    });

    it('should generate examples within the valid range (10-15)', async () => {
      // Requirement 7.1
      const examples12 = await service.getExamples('test', 12);
      const examples15 = await service.getExamples('test', 15);

      expect(examples12).toHaveLength(12);
      expect(examples15).toHaveLength(15);
    });

    it('should adjust count if below minimum (10)', async () => {
      // Requirement 7.1
      const examples = await service.getExamples('test', 5);

      expect(examples.length).toBeGreaterThanOrEqual(10);
    });

    it('should adjust count if above maximum (15)', async () => {
      // Requirement 7.1
      const examples = await service.getExamples('test', 20);

      expect(examples.length).toBeLessThanOrEqual(15);
    });

    it('should include sentence, translation, and highlightWord', async () => {
      // Requirement 7.4
      const examples = await service.getExamples('test', 10);

      for (const example of examples) {
        expect(example.sentence).toBeDefined();
        expect(example.sentence.length).toBeGreaterThan(0);
        expect(example.translation).toBeDefined();
        expect(example.translation.length).toBeGreaterThan(0);
        expect(example.highlightWord).toBeDefined();
        expect(example.highlightWord).toBe('test');
      }
    });

    it('should include Chinese translations for all examples', async () => {
      // Requirement 7.4
      const examples = await service.getExamples('hello', 10);

      for (const example of examples) {
        expect(example.translation).toBeDefined();
        expect(example.translation.trim().length).toBeGreaterThan(0);
      }
    });

    it('should generate different examples for different words', async () => {
      // Requirement 7.1
      const examples1 = await service.getExamples('test', 10);
      const examples2 = await service.getExamples('hello', 10);

      // At least some examples should be different
      const allSame = examples1.every((ex1, i) => ex1.sentence === examples2[i].sentence);
      expect(allSame).toBe(false);
    });
  });

  describe('validateExamples', () => {
    it('should return true for valid examples', () => {
      // Requirement 7.1, 7.4
      const validExamples: ExampleSentence[] = [
        {
          sentence: 'This is a test.',
          translation: '这是一个测试。',
          highlightWord: 'test',
        },
        {
          sentence: 'I test the code.',
          translation: '我测试代码。',
          highlightWord: 'test',
        },
      ];

      const result = service.validateExamples(validExamples);

      expect(result).toBe(true);
    });

    it('should return false for empty array', () => {
      // Requirement 7.1
      const result = service.validateExamples([]);

      expect(result).toBe(false);
    });

    it('should return false if sentence is empty', () => {
      // Requirement 7.1
      const invalidExamples: ExampleSentence[] = [
        {
          sentence: '',
          translation: '这是一个测试。',
          highlightWord: 'test',
        },
      ];

      const result = service.validateExamples(invalidExamples);

      expect(result).toBe(false);
    });

    it('should return false if translation is empty', () => {
      // Requirement 7.4
      const invalidExamples: ExampleSentence[] = [
        {
          sentence: 'This is a test.',
          translation: '',
          highlightWord: 'test',
        },
      ];

      const result = service.validateExamples(invalidExamples);

      expect(result).toBe(false);
    });

    it('should return false if highlightWord is empty', () => {
      // Requirement 7.1
      const invalidExamples: ExampleSentence[] = [
        {
          sentence: 'This is a test.',
          translation: '这是一个测试。',
          highlightWord: '',
        },
      ];

      const result = service.validateExamples(invalidExamples);

      expect(result).toBe(false);
    });

    it('should return false if sentence does not contain highlightWord', () => {
      // Requirement 7.1
      const invalidExamples: ExampleSentence[] = [
        {
          sentence: 'This is an example.',
          translation: '这是一个例子。',
          highlightWord: 'test',
        },
      ];

      const result = service.validateExamples(invalidExamples);

      expect(result).toBe(false);
    });

    it('should validate highlightWord case-insensitively', () => {
      // Requirement 7.1
      const validExamples: ExampleSentence[] = [
        {
          sentence: 'This is a TEST.',
          translation: '这是一个测试。',
          highlightWord: 'test',
        },
      ];

      const result = service.validateExamples(validExamples);

      expect(result).toBe(true);
    });

    it('should return true if all examples are valid', () => {
      // Requirement 7.1, 7.4
      const validExamples: ExampleSentence[] = [
        {
          sentence: 'First test sentence.',
          translation: '第一个测试句子。',
          highlightWord: 'test',
        },
        {
          sentence: 'Second test sentence.',
          translation: '第二个测试句子。',
          highlightWord: 'test',
        },
        {
          sentence: 'Third test sentence.',
          translation: '第三个测试句子。',
          highlightWord: 'test',
        },
      ];

      const result = service.validateExamples(validExamples);

      expect(result).toBe(true);
    });

    it('should return false if any example is invalid', () => {
      // Requirement 7.1
      const mixedExamples: ExampleSentence[] = [
        {
          sentence: 'Valid test sentence.',
          translation: '有效的测试句子。',
          highlightWord: 'test',
        },
        {
          sentence: 'Invalid sentence.',
          translation: '无效的句子。',
          highlightWord: 'test', // Word not in sentence
        },
      ];

      const result = service.validateExamples(mixedExamples);

      expect(result).toBe(false);
    });
  });
});

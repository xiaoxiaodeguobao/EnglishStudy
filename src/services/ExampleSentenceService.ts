/**
 * ExampleSentenceService Implementation
 * 
 * Provides example sentences for words using AI services.
 * Includes validation and error handling.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 12.2
 */

import type { ExampleSentenceService, ExampleSentence } from '../types';
import { NetworkError } from '../types/error';

/**
 * Logger utility
 */
class Logger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(`[${new Date().toISOString()}] [INFO] ${message}`, context || '');
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, context || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, context || '');
  }
}

/**
 * ExampleSentenceService implementation
 * 
 * Note: This is a mock implementation that generates example sentences.
 * In production, this would integrate with an AI service (OpenAI/Claude) or
 * use a corpus-based API to fetch real example sentences.
 */
export class ExampleSentenceServiceImpl implements ExampleSentenceService {
  /**
   * Generate example sentences for a word
   * Requirements: 7.1, 7.2, 7.4
   * 
   * @param word - The word to generate examples for
   * @param count - Number of examples to generate (10-15)
   * @returns Array of example sentences with translations
   */
  async getExamples(word: string, count: number): Promise<ExampleSentence[]> {
    try {
      Logger.info('Generating example sentences', { word, count });

      // Validate count is within range (10-15)
      if (count < 10 || count > 15) {
        Logger.warn('Example count out of range, adjusting', {
          requested: count,
          adjusted: Math.max(10, Math.min(15, count)),
        });
        count = Math.max(10, Math.min(15, count));
      }

      // Mock implementation: Generate example sentences
      // In production, this would call an AI API
      const examples: ExampleSentence[] = [];

      const templates = [
        { en: `I ${word} every day.`, cn: `我每天${word}。` },
        { en: `She likes to ${word}.`, cn: `她喜欢${word}。` },
        { en: `The ${word} is important.`, cn: `${word}很重要。` },
        { en: `We need to ${word} more.`, cn: `我们需要更多地${word}。` },
        { en: `Can you ${word} this?`, cn: `你能${word}这个吗？` },
        { en: `He ${word}s very well.`, cn: `他${word}得很好。` },
        { en: `They are ${word}ing now.`, cn: `他们现在正在${word}。` },
        { en: `This ${word} is excellent.`, cn: `这个${word}很棒。` },
        { en: `I want to ${word} tomorrow.`, cn: `我想明天${word}。` },
        { en: `The ${word} was successful.`, cn: `${word}很成功。` },
        { en: `She ${word}ed yesterday.`, cn: `她昨天${word}了。` },
        { en: `We should ${word} together.`, cn: `我们应该一起${word}。` },
        { en: `That ${word} is amazing.`, cn: `那个${word}很棒。` },
        { en: `I have ${word}ed before.`, cn: `我以前${word}过。` },
        { en: `The ${word} will help us.`, cn: `${word}会帮助我们。` },
      ];

      for (let i = 0; i < count && i < templates.length; i++) {
        examples.push({
          sentence: templates[i].en,
          translation: templates[i].cn,
          highlightWord: word,
        });
      }

      Logger.info('Example sentences generated', {
        word,
        count: examples.length,
      });

      return examples;
    } catch (error) {
      Logger.error('Failed to generate example sentences', {
        word,
        count,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new NetworkError('无法生成例句');
    }
  }

  /**
   * Validate example sentences
   * Requirements: 7.1, 7.4
   * 
   * @param examples - Array of example sentences to validate
   * @returns true if all examples are valid
   */
  validateExamples(examples: ExampleSentence[]): boolean {
    Logger.info('Validating example sentences', { count: examples.length });

    // Check if examples array is not empty
    if (!examples || examples.length === 0) {
      Logger.warn('No examples to validate');
      return false;
    }

    // Validate each example
    for (const example of examples) {
      // Check if sentence exists and is not empty
      if (!example.sentence || example.sentence.trim().length === 0) {
        Logger.warn('Invalid example: empty sentence', { example });
        return false;
      }

      // Check if translation exists and is not empty (Requirement 7.4)
      if (!example.translation || example.translation.trim().length === 0) {
        Logger.warn('Invalid example: empty translation', { example });
        return false;
      }

      // Check if highlightWord exists
      if (!example.highlightWord || example.highlightWord.trim().length === 0) {
        Logger.warn('Invalid example: empty highlightWord', { example });
        return false;
      }

      // Check if sentence contains the highlight word (case-insensitive)
      const sentenceLower = example.sentence.toLowerCase();
      const highlightLower = example.highlightWord.toLowerCase();
      
      if (!sentenceLower.includes(highlightLower)) {
        Logger.warn('Invalid example: sentence does not contain highlight word', {
          sentence: example.sentence,
          highlightWord: example.highlightWord,
        });
        return false;
      }
    }

    Logger.info('Example sentences validation passed', { count: examples.length });
    return true;
  }
}

// Export singleton instance
export const exampleSentenceService = new ExampleSentenceServiceImpl();

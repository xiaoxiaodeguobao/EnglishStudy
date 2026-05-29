/**
 * Context Analyzer Tests
 * 
 * Tests for ContextAnalyzer interface and implementation.
 * Validates context identification, confidence scoring, and fallback logic.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextAnalyzerImpl } from './ContextAnalyzer';
import { AIService, AIGenerationRequest, AIGenerationResponse } from '../ai/types';

/**
 * Mock AI Service for testing
 */
class MockAIService implements AIService {
  generateExamples = vi.fn();
  generateSentenceChains = vi.fn();
  validateConnection = vi.fn();
}

describe('ContextAnalyzer', () => {
  let mockAIService: MockAIService;
  let analyzer: ContextAnalyzerImpl;

  beforeEach(() => {
    mockAIService = new MockAIService();
    analyzer = new ContextAnalyzerImpl(mockAIService);
  });

  describe('analyzeContexts', () => {
    it('should identify at least one context for any word', async () => {
      // Requirement 1.1: Identify at least one application context type
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));

      const result = await analyzer.analyzeContexts('test');

      expect(result.contexts).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
      expect(result.primaryContext).toBeDefined();
    });

    it('should return confidence scores for all context types', async () => {
      // Requirement 1.1: Identify application context types
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));

      const result = await analyzer.analyzeContexts('test');

      expect(result.confidence).toBeDefined();
      expect(result.confidence['daily-conversation']).toBeGreaterThanOrEqual(0);
      expect(result.confidence['daily-conversation']).toBeLessThanOrEqual(1);
      expect(result.confidence['business-communication']).toBeGreaterThanOrEqual(0);
      expect(result.confidence['business-communication']).toBeLessThanOrEqual(1);
      expect(result.confidence['academic-writing']).toBeGreaterThanOrEqual(0);
      expect(result.confidence['academic-writing']).toBeLessThanOrEqual(1);
      expect(result.confidence['technical-documentation']).toBeGreaterThanOrEqual(0);
      expect(result.confidence['technical-documentation']).toBeLessThanOrEqual(1);
      expect(result.confidence['literary-expression']).toBeGreaterThanOrEqual(0);
      expect(result.confidence['literary-expression']).toBeLessThanOrEqual(1);
    });

    it('should identify multiple contexts for versatile words', async () => {
      // Requirement 1.3: Support multiple contexts per word
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));

      const result = await analyzer.analyzeContexts('communication');

      // "communication" should be suitable for multiple contexts
      expect(result.contexts.length).toBeGreaterThanOrEqual(2);
    });

    it('should set primary context to the highest confidence context', async () => {
      // Requirement 1.1: Identify primary context
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));

      const result = await analyzer.analyzeContexts('test');

      // Primary context should be in the contexts array
      expect(result.contexts).toContain(result.primaryContext);
      
      // Primary context should have the highest confidence
      const primaryConfidence = result.confidence[result.primaryContext];
      Object.entries(result.confidence).forEach(([context, score]) => {
        if (context !== result.primaryContext) {
          expect(primaryConfidence).toBeGreaterThanOrEqual(score);
        }
      });
    });

    it('should fall back to heuristic analysis when AI fails', async () => {
      // Test fallback mechanism
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));

      const result = await analyzer.analyzeContexts('test');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
      expect(mockAIService.generateExamples).toHaveBeenCalledTimes(1);
    });

    it('should use AI-based analysis when available', async () => {
      // Test AI-based analysis path
      const mockResponse: AIGenerationResponse = {
        examples: [
          {
            sentence: 'This is a test sentence.',
            translation: '这是一个测试句子。',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 50,
          generationTime: 1000,
        },
      };

      mockAIService.generateExamples.mockResolvedValue(mockResponse);

      const result = await analyzer.analyzeContexts('test');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
      expect(mockAIService.generateExamples).toHaveBeenCalledTimes(1);
    });
  });

  describe('heuristic analysis', () => {
    beforeEach(() => {
      // Force heuristic analysis by making AI fail
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));
    });

    it('should identify technical words with specialized suffixes', async () => {
      // Words with technical suffixes should have higher technical/academic scores
      const result = await analyzer.analyzeContexts('documentation');

      expect(result.confidence['academic-writing']).toBeGreaterThan(0.5);
    });

    it('should identify business-related words', async () => {
      // Business words should have higher business communication scores
      const result = await analyzer.analyzeContexts('management');

      expect(result.confidence['business-communication']).toBeGreaterThan(0.5);
    });

    it('should identify literary/expressive words', async () => {
      // Literary words should have higher literary expression scores
      const result = await analyzer.analyzeContexts('passion');

      expect(result.confidence['literary-expression']).toBeGreaterThan(0.5);
    });

    it('should favor daily conversation for short common words', async () => {
      // Short words should have high daily conversation scores
      const result = await analyzer.analyzeContexts('run');

      expect(result.confidence['daily-conversation']).toBeGreaterThan(0.7);
    });

    it('should favor formal contexts for long words', async () => {
      // Long words should have higher formal context scores
      const result = await analyzer.analyzeContexts('internationalization');

      expect(result.confidence['academic-writing']).toBeGreaterThan(0.4);
    });

    it('should identify technical prefixes', async () => {
      // Words with technical prefixes should have higher technical scores
      const result = await analyzer.analyzeContexts('microprocessor');

      expect(result.confidence['technical-documentation']).toBeGreaterThan(0.5);
    });

    it('should default to daily conversation when no strong signals', async () => {
      // Generic words should default to daily conversation
      const result = await analyzer.analyzeContexts('thing');

      expect(result.primaryContext).toBe('daily-conversation');
      expect(result.contexts).toContain('daily-conversation');
    });

    it('should return contexts with confidence > 0.5', async () => {
      // Only contexts with confidence > 0.5 should be included
      const result = await analyzer.analyzeContexts('test');

      result.contexts.forEach((context) => {
        expect(result.confidence[context]).toBeGreaterThan(0.5);
      });
    });

    it('should ensure at least one context is always returned', async () => {
      // Even for obscure words, at least one context should be returned
      const result = await analyzer.analyzeContexts('xyz');

      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
      expect(result.primaryContext).toBeDefined();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockAIService.generateExamples.mockRejectedValue(new Error('AI service unavailable'));
    });

    it('should handle empty strings gracefully', async () => {
      const result = await analyzer.analyzeContexts('');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle single character words', async () => {
      const result = await analyzer.analyzeContexts('a');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle words with mixed case', async () => {
      const result = await analyzer.analyzeContexts('TeSt');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle words with special characters', async () => {
      const result = await analyzer.analyzeContexts('test-word');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very long words', async () => {
      const result = await analyzer.analyzeContexts('pneumonoultramicroscopicsilicovolcanoconiosis');

      expect(result).toBeDefined();
      expect(result.contexts.length).toBeGreaterThanOrEqual(1);
    });
  });
});

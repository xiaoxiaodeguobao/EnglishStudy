/**
 * Unit tests for AI Service types
 * 
 * Tests type definitions, error handling, and interface contracts
 */

import { describe, it, expect } from 'vitest';
import {
  AIServiceError,
  type ApplicationContext,
  type AIServiceConfig,
  type AIGenerationRequest,
  type AIGenerationResponse,
  type AIService,
} from './types';

describe('AI Service Types', () => {
  describe('ApplicationContext', () => {
    it('should accept valid context types', () => {
      const contexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ];

      expect(contexts).toHaveLength(5);
      contexts.forEach((context) => {
        expect(typeof context).toBe('string');
      });
    });
  });

  describe('AIServiceConfig', () => {
    it('should define valid configuration structure', () => {
      const config: AIServiceConfig = {
        apiKey: 'test-key',
        model: 'gpt-3.5-turbo',
        apiUrl: 'https://api.openai.com/v1',
        maxRetries: 2,
        timeout: 30000,
      };

      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('gpt-3.5-turbo');
      expect(config.apiUrl).toBe('https://api.openai.com/v1');
      expect(config.maxRetries).toBe(2);
      expect(config.timeout).toBe(30000);
    });
  });

  describe('AIGenerationRequest', () => {
    it('should define valid request structure without constraints', () => {
      const request: AIGenerationRequest = {
        word: 'example',
        context: 'daily-conversation',
        count: 5,
      };

      expect(request.word).toBe('example');
      expect(request.context).toBe('daily-conversation');
      expect(request.count).toBe(5);
      expect(request.constraints).toBeUndefined();
    });

    it('should define valid request structure with constraints', () => {
      const request: AIGenerationRequest = {
        word: 'example',
        context: 'business-communication',
        count: 10,
        constraints: {
          minLength: 8,
          maxLength: 20,
          avoidPatterns: ['^I ', '^The '],
        },
      };

      expect(request.constraints).toBeDefined();
      expect(request.constraints?.minLength).toBe(8);
      expect(request.constraints?.maxLength).toBe(20);
      expect(request.constraints?.avoidPatterns).toHaveLength(2);
    });
  });

  describe('AIGenerationResponse', () => {
    it('should define valid response structure', () => {
      const response: AIGenerationResponse = {
        examples: [
          {
            sentence: 'This is an example sentence.',
            translation: '这是一个例句。',
            highlightWord: 'example',
          },
        ],
        metadata: {
          model: 'gpt-3.5-turbo',
          tokensUsed: 150,
          generationTime: 1200,
        },
      };

      expect(response.examples).toHaveLength(1);
      expect(response.examples[0].sentence).toBe('This is an example sentence.');
      expect(response.examples[0].translation).toBe('这是一个例句。');
      expect(response.examples[0].highlightWord).toBe('example');
      expect(response.metadata.model).toBe('gpt-3.5-turbo');
      expect(response.metadata.tokensUsed).toBe(150);
      expect(response.metadata.generationTime).toBe(1200);
    });
  });

  describe('AIServiceError', () => {
    it('should create error with all properties', () => {
      const originalError = new Error('Network timeout');
      const error = new AIServiceError(
        'Failed to generate examples',
        'openai',
        500,
        originalError
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AIServiceError);
      expect(error.name).toBe('AIServiceError');
      expect(error.message).toBe('Failed to generate examples');
      expect(error.provider).toBe('openai');
      expect(error.statusCode).toBe(500);
      expect(error.originalError).toBe(originalError);
    });

    it('should create error without optional properties', () => {
      const error = new AIServiceError('API key invalid', 'claude');

      expect(error.name).toBe('AIServiceError');
      expect(error.message).toBe('API key invalid');
      expect(error.provider).toBe('claude');
      expect(error.statusCode).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });

    it('should have proper error stack trace', () => {
      const error = new AIServiceError('Test error', 'openai');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AIServiceError');
    });
  });

  describe('AIService Interface', () => {
    it('should define generateExamples method signature', () => {
      // This is a compile-time check - if types are wrong, TypeScript will error
      const mockService: AIService = {
        generateExamples: async (request: AIGenerationRequest) => {
          return {
            examples: [],
            metadata: {
              model: 'test',
              tokensUsed: 0,
              generationTime: 0,
            },
          };
        },
        generateSentenceChains: async (words, context, count) => {
          return [];
        },
        validateConnection: async () => true,
      };

      expect(mockService.generateExamples).toBeDefined();
      expect(typeof mockService.generateExamples).toBe('function');
    });

    it('should define generateSentenceChains method signature', () => {
      const mockService: AIService = {
        generateExamples: async () => ({
          examples: [],
          metadata: { model: '', tokensUsed: 0, generationTime: 0 },
        }),
        generateSentenceChains: async (words, context, count) => {
          return [
            {
              sentence: 'Test sentence',
              translation: '测试句子',
              usedWords: words,
            },
          ];
        },
        validateConnection: async () => true,
      };

      expect(mockService.generateSentenceChains).toBeDefined();
      expect(typeof mockService.generateSentenceChains).toBe('function');
    });

    it('should define validateConnection method signature', () => {
      const mockService: AIService = {
        generateExamples: async () => ({
          examples: [],
          metadata: { model: '', tokensUsed: 0, generationTime: 0 },
        }),
        generateSentenceChains: async () => [],
        validateConnection: async () => true,
      };

      expect(mockService.validateConnection).toBeDefined();
      expect(typeof mockService.validateConnection).toBe('function');
    });
  });

  describe('Type compatibility', () => {
    it('should allow AIGenerationResponse examples to be used as ExampleSentence', () => {
      const response: AIGenerationResponse = {
        examples: [
          {
            sentence: 'Test',
            translation: '测试',
            highlightWord: 'test',
          },
        ],
        metadata: {
          model: 'test',
          tokensUsed: 0,
          generationTime: 0,
        },
      };

      // Should be compatible with ExampleSentence structure
      const example = response.examples[0];
      expect(example.sentence).toBeDefined();
      expect(example.translation).toBeDefined();
      expect(example.highlightWord).toBeDefined();
    });

    it('should allow sentence chain results to have required properties', () => {
      const chains = [
        {
          sentence: 'This uses multiple words.',
          translation: '这使用多个单词。',
          usedWords: ['multiple', 'words'],
        },
      ];

      expect(chains[0].sentence).toBeDefined();
      expect(chains[0].translation).toBeDefined();
      expect(chains[0].usedWords).toBeInstanceOf(Array);
      expect(chains[0].usedWords).toHaveLength(2);
    });
  });
});

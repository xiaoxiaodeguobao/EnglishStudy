/**
 * OpenAI Adapter Unit Tests
 * 
 * Tests the OpenAI adapter implementation including:
 * - Example sentence generation
 * - Sentence chain generation
 * - Connection validation
 * - Error handling
 * - JSON parsing
 * 
 * **Validates: Requirements 6.3, 3.1, 3.2**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIAdapter } from './OpenAIAdapter';
import { AIServiceConfig, AIServiceError } from './types';
import { httpClient } from '../../utils/httpClient';

// Mock httpClient
vi.mock('../../utils/httpClient', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('OpenAIAdapter', () => {
  let adapter: OpenAIAdapter;
  let config: AIServiceConfig;

  beforeEach(() => {
    config = {
      apiKey: 'sk-test-key-123',
      model: 'gpt-3.5-turbo',
      apiUrl: 'https://api.openai.com/v1',
      maxRetries: 3,
      timeout: 30000,
    };
    adapter = new OpenAIAdapter(config);
    vi.clearAllMocks();
  });

  describe('generateExamples', () => {
    it('should generate examples successfully', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          id: 'chatcmpl-123',
          object: 'chat.completion',
          created: 1677652288,
          model: 'gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: JSON.stringify([
                  {
                    sentence: 'I need to study for my exam tomorrow.',
                    translation: '我需要为明天的考试学习。',
                    highlightWord: 'study',
                  },
                  {
                    sentence: 'She studies biology at the university.',
                    translation: '她在大学学习生物学。',
                    highlightWord: 'study',
                  },
                ]),
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 50,
            completion_tokens: 100,
            total_tokens: 150,
          },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await adapter.generateExamples({
        word: 'study',
        context: 'daily-conversation',
        count: 2,
      });

      // Verify API call
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
          temperature: 0.8,
          max_tokens: 2000,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key-123',
          }),
          timeout: 30000,
          retries: 3,
        })
      );

      // Verify result structure
      expect(result.examples).toHaveLength(2);
      expect(result.examples[0]).toEqual({
        sentence: 'I need to study for my exam tomorrow.',
        translation: '我需要为明天的考试学习。',
        highlightWord: 'study',
      });
      expect(result.metadata.model).toBe('gpt-3.5-turbo');
      expect(result.metadata.tokensUsed).toBe(150);
      expect(result.metadata.generationTime).toBeGreaterThanOrEqual(0);
    });

    it('should include constraints in prompt when provided', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'Test sentence.',
                    translation: '测试句子。',
                    highlightWord: 'test',
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 100 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await adapter.generateExamples({
        word: 'test',
        context: 'academic-writing',
        count: 1,
        constraints: {
          minLength: 10,
          maxLength: 15,
          avoidPatterns: ['simple'],
        },
      });

      const callArgs = vi.mocked(httpClient.post).mock.calls[0];
      const requestBody = callArgs[1] as any;
      const userMessage = requestBody.messages[1].content;

      expect(userMessage).toContain('between 10 and 15 words');
      expect(userMessage).toContain('scholarly and research');
    });

    it('should handle JSON wrapped in markdown code blocks', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: '```json\n[{"sentence": "Test.", "translation": "测试。", "highlightWord": "test"}]\n```',
              },
            },
          ],
          usage: { total_tokens: 50 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await adapter.generateExamples({
        word: 'test',
        context: 'daily-conversation',
        count: 1,
      });

      expect(result.examples).toHaveLength(1);
      expect(result.examples[0].sentence).toBe('Test.');
    });

    it('should throw AIServiceError when API call fails', async () => {
      const mockError = new Error('Network error');
      (mockError as any).status = 500;
      vi.mocked(httpClient.post).mockRejectedValue(mockError);

      await expect(
        adapter.generateExamples({
          word: 'test',
          context: 'daily-conversation',
          count: 1,
        })
      ).rejects.toThrow(AIServiceError);
    });

    it('should throw AIServiceError when response has no content', async () => {
      const mockResponse = {
        data: {
          choices: [],
          usage: { total_tokens: 0 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await expect(
        adapter.generateExamples({
          word: 'test',
          context: 'daily-conversation',
          count: 1,
        })
      ).rejects.toThrow(AIServiceError);
    });

    it('should throw AIServiceError when JSON parsing fails', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: 'This is not valid JSON',
              },
            },
          ],
          usage: { total_tokens: 10 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await expect(
        adapter.generateExamples({
          word: 'test',
          context: 'daily-conversation',
          count: 1,
        })
      ).rejects.toThrow(AIServiceError);
    });

    it('should throw AIServiceError when examples are missing required fields', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'Test sentence.',
                    // Missing translation and highlightWord
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 10 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await expect(
        adapter.generateExamples({
          word: 'test',
          context: 'daily-conversation',
          count: 1,
        })
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('generateSentenceChains', () => {
    it('should generate sentence chains successfully', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'I need to study and practice every day.',
                    translation: '我需要每天学习和练习。',
                    usedWords: ['study', 'practice'],
                  },
                  {
                    sentence: 'She studies hard to improve her skills.',
                    translation: '她努力学习以提高技能。',
                    usedWords: ['study', 'improve'],
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 200 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await adapter.generateSentenceChains(
        ['study', 'practice', 'improve'],
        'daily-conversation',
        2
      );

      // Verify API call
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          temperature: 0.8,
        }),
        expect.any(Object)
      );

      // Verify result structure
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sentence: 'I need to study and practice every day.',
        translation: '我需要每天学习和练习。',
        usedWords: ['study', 'practice'],
      });
      expect(result[0].usedWords).toHaveLength(2);
    });

    it('should include word list and context in prompt', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'Test.',
                    translation: '测试。',
                    usedWords: ['test'],
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 50 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await adapter.generateSentenceChains(
        ['word1', 'word2', 'word3'],
        'business-communication',
        3
      );

      const callArgs = vi.mocked(httpClient.post).mock.calls[0];
      const requestBody = callArgs[1] as any;
      const userMessage = requestBody.messages[1].content;

      expect(userMessage).toContain('word1, word2, word3');
      expect(userMessage).toContain('professional workplace');
      expect(userMessage).toContain('at least 2 and at most 4 words');
    });

    it('should throw AIServiceError when chain parsing fails', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'Test.',
                    // Missing translation and usedWords
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 10 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await expect(
        adapter.generateSentenceChains(['test'], 'daily-conversation', 1)
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('validateConnection', () => {
    it('should return true when connection is valid', async () => {
      vi.mocked(httpClient.post).mockResolvedValue({
        data: {
          choices: [{ message: { content: 'hi' } }],
          usage: { total_tokens: 1 },
        },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      });

      const result = await adapter.validateConnection();

      expect(result).toBe(true);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          max_tokens: 1,
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'hi' }),
          ]),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key-123',
          }),
          timeout: 5000,
          retries: 1,
        })
      );
    });

    it('should return false when connection fails', async () => {
      vi.mocked(httpClient.post).mockRejectedValue(new Error('Connection failed'));

      const result = await adapter.validateConnection();

      expect(result).toBe(false);
    });
  });

  describe('prompt construction', () => {
    it('should construct prompts with correct context descriptions', async () => {
      const contexts: Array<{
        context: 'daily-conversation' | 'business-communication' | 'academic-writing' | 'technical-documentation' | 'literary-expression';
        expectedText: string;
      }> = [
        { context: 'daily-conversation', expectedText: 'everyday informal speech' },
        { context: 'business-communication', expectedText: 'professional workplace' },
        { context: 'academic-writing', expectedText: 'scholarly and research' },
        { context: 'technical-documentation', expectedText: 'specialized technical' },
        { context: 'literary-expression', expectedText: 'creative and artistic' },
      ];

      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'Test.',
                    translation: '测试。',
                    highlightWord: 'test',
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 10 },
        },
      };

      for (const { context, expectedText } of contexts) {
        vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

        await adapter.generateExamples({
          word: 'test',
          context,
          count: 1,
        });

        const callArgs = vi.mocked(httpClient.post).mock.calls[0];
        const requestBody = callArgs[1] as any;
        const userMessage = requestBody.messages[1].content;

        expect(userMessage).toContain(expectedText);
        vi.clearAllMocks();
      }
    });

    it('should request natural and idiomatic sentences in system prompt', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify([
                  {
                    sentence: 'Test.',
                    translation: '测试。',
                    highlightWord: 'test',
                  },
                ]),
              },
            },
          ],
          usage: { total_tokens: 10 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await adapter.generateExamples({
        word: 'test',
        context: 'daily-conversation',
        count: 1,
      });

      const callArgs = vi.mocked(httpClient.post).mock.calls[0];
      const requestBody = callArgs[1] as any;
      const systemMessage = requestBody.messages[0].content;

      expect(systemMessage).toContain('natural');
      expect(systemMessage).toContain('native speaker');
    });
  });

  describe('error handling', () => {
    it('should include provider name in error', async () => {
      vi.mocked(httpClient.post).mockRejectedValue(new Error('API error'));

      try {
        await adapter.generateExamples({
          word: 'test',
          context: 'daily-conversation',
          count: 1,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AIServiceError);
        expect((error as AIServiceError).provider).toBe('openai');
      }
    });

    it('should include status code in error when available', async () => {
      const mockError = new Error('API error');
      (mockError as any).status = 429;
      vi.mocked(httpClient.post).mockRejectedValue(mockError);

      try {
        await adapter.generateExamples({
          word: 'test',
          context: 'daily-conversation',
          count: 1,
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AIServiceError);
        expect((error as AIServiceError).statusCode).toBe(429);
      }
    });
  });
});

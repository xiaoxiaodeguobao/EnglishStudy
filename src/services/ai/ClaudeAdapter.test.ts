/**
 * Claude Adapter Unit Tests
 * 
 * Tests the Claude adapter implementation including:
 * - Example sentence generation
 * - Sentence chain generation
 * - Connection validation
 * - Error handling
 * - JSON parsing
 * 
 * **Validates: Requirements 6.4, 3.1, 3.2**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeAdapter } from './ClaudeAdapter';
import { AIServiceConfig, AIServiceError } from './types';
import { httpClient } from '../../utils/httpClient';

// Mock httpClient
vi.mock('../../utils/httpClient', () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('ClaudeAdapter', () => {
  let adapter: ClaudeAdapter;
  let config: AIServiceConfig;

  beforeEach(() => {
    config = {
      apiKey: 'sk-ant-test-key-123',
      model: 'claude-3-sonnet-20240229',
      apiUrl: 'https://api.anthropic.com/v1',
      maxRetries: 3,
      timeout: 30000,
    };
    adapter = new ClaudeAdapter(config);
    vi.clearAllMocks();
  });

  describe('generateExamples', () => {
    it('should generate examples successfully', async () => {
      // Mock successful API response
      const mockResponse = {
        data: {
          id: 'msg_123',
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: JSON.stringify([
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
          ],
          model: 'claude-3-sonnet-20240229',
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: {
            input_tokens: 50,
            output_tokens: 100,
          },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await adapter.generateExamples({
        word: 'study',
        context: 'daily-conversation',
        count: 2,
      });

      // Verify API call uses Claude-specific headers
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          temperature: 0.8,
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user' }),
          ]),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-test-key-123',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
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
      expect(result.metadata.model).toBe('claude-3-sonnet-20240229');
      expect(result.metadata.tokensUsed).toBe(150); // input_tokens + output_tokens
      expect(result.metadata.generationTime).toBeGreaterThanOrEqual(0);
    });

    it('should include constraints in prompt when provided', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test sentence.',
                  translation: '测试句子。',
                  highlightWord: 'test',
                },
              ]),
            },
          ],
          usage: { input_tokens: 50, output_tokens: 50 },
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
      const userMessage = requestBody.messages[0].content;

      expect(userMessage).toContain('between 10 and 15 words');
      expect(userMessage).toContain('scholarly and research');
    });

    it('should handle JSON wrapped in markdown code blocks', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              type: 'text',
              text: '```json\n[{"sentence": "Test.", "translation": "测试。", "highlightWord": "test"}]\n```',
            },
          ],
          usage: { input_tokens: 20, output_tokens: 30 },
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
          content: [],
          usage: { input_tokens: 0, output_tokens: 0 },
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
          content: [
            {
              type: 'text',
              text: 'This is not valid JSON',
            },
          ],
          usage: { input_tokens: 5, output_tokens: 5 },
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
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test sentence.',
                  // Missing translation and highlightWord
                },
              ]),
            },
          ],
          usage: { input_tokens: 5, output_tokens: 5 },
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
          content: [
            {
              type: 'text',
              text: JSON.stringify([
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
          ],
          usage: { input_tokens: 100, output_tokens: 100 },
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
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
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
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test.',
                  translation: '测试。',
                  usedWords: ['test'],
                },
              ]),
            },
          ],
          usage: { input_tokens: 25, output_tokens: 25 },
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
      const userMessage = requestBody.messages[0].content;

      expect(userMessage).toContain('word1, word2, word3');
      expect(userMessage).toContain('professional workplace');
      expect(userMessage).toContain('at least 2 and at most 4 words');
    });

    it('should throw AIServiceError when chain parsing fails', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test.',
                  // Missing translation and usedWords
                },
              ]),
            },
          ],
          usage: { input_tokens: 5, output_tokens: 5 },
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
          content: [{ type: 'text', text: 'test' }],
          usage: { input_tokens: 1, output_tokens: 1 },
        },
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      });

      const result = await adapter.validateConnection();

      expect(result).toBe(true);
      expect(httpClient.post).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'sk-ant-test-key-123',
            'anthropic-version': '2023-06-01',
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
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test.',
                  translation: '测试。',
                  highlightWord: 'test',
                },
              ]),
            },
          ],
          usage: { input_tokens: 5, output_tokens: 5 },
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
        const userMessage = requestBody.messages[0].content;

        expect(userMessage).toContain(expectedText);
        vi.clearAllMocks();
      }
    });

    it('should request natural and idiomatic sentences in prompt', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test.',
                  translation: '测试。',
                  highlightWord: 'test',
                },
              ]),
            },
          ],
          usage: { input_tokens: 5, output_tokens: 5 },
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
      const userMessage = requestBody.messages[0].content;

      expect(userMessage).toContain('natural');
      expect(userMessage).toContain('native speaker');
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
        expect((error as AIServiceError).provider).toBe('claude');
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

  describe('Claude-specific behavior', () => {
    it('should use Claude Messages API format', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test.',
                  translation: '测试。',
                  highlightWord: 'test',
                },
              ]),
            },
          ],
          usage: { input_tokens: 5, output_tokens: 5 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      await adapter.generateExamples({
        word: 'test',
        context: 'daily-conversation',
        count: 1,
      });

      const callArgs = vi.mocked(httpClient.post).mock.calls[0];
      const [url, body, options] = callArgs;

      // Verify Claude-specific endpoint
      expect(url).toBe('https://api.anthropic.com/v1/messages');

      // Verify Claude-specific headers
      expect(options.headers).toHaveProperty('x-api-key');
      expect(options.headers).toHaveProperty('anthropic-version');
      expect(options.headers['anthropic-version']).toBe('2023-06-01');

      // Verify Claude message format (no system message, only user messages)
      expect(body.messages).toHaveLength(1);
      expect(body.messages[0].role).toBe('user');
    });

    it('should calculate total tokens from input and output tokens', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              type: 'text',
              text: JSON.stringify([
                {
                  sentence: 'Test.',
                  translation: '测试。',
                  highlightWord: 'test',
                },
              ]),
            },
          ],
          usage: { input_tokens: 75, output_tokens: 125 },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await adapter.generateExamples({
        word: 'test',
        context: 'daily-conversation',
        count: 1,
      });

      expect(result.metadata.tokensUsed).toBe(200); // 75 + 125
    });
  });
});

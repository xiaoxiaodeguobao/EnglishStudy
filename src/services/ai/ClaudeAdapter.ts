/**
 * Claude Adapter Implementation
 * 
 * Implements the AIService interface for Anthropic Claude API integration.
 * Provides natural, contextual example sentence generation using Claude models.
 * 
 * **Validates: Requirements 6.4, 3.1, 3.2**
 */

import { httpClient } from '../../utils/httpClient';
import {
  AIService,
  AIServiceConfig,
  AIGenerationRequest,
  AIGenerationResponse,
  AIServiceError,
  ApplicationContext,
  WordListGenerationRequest,
  WordListGenerationResponse,
} from './types';
import { withRetry, RetryExhaustedError } from './RetryHandler';
import { extractJSON } from './WordListResponseParser';

/**
 * Claude API response structure for messages
 */
interface ClaudeMessageResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Logger utility for Claude adapter
 */
class ClaudeLogger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(`[${new Date().toISOString()}] [CLAUDE] [INFO] ${message}`, context || '');
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [CLAUDE] [ERROR] ${message}`, context || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${new Date().toISOString()}] [CLAUDE] [WARN] ${message}`, context || '');
  }
}

/**
 * Claude Adapter
 * 
 * Implements AIService interface for Anthropic Claude API.
 * Uses httpClient utility for API calls with retry logic and error handling.
 * Uses Claude's Messages API format with x-api-key and anthropic-version headers.
 * 
 * Requirement 6.4: Claude adapter implementation
 * Requirement 3.1: Use AI service for natural sentence generation
 * Requirement 3.2: Request natural and idiomatic examples in prompts
 */
export class ClaudeAdapter implements AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * Generate example sentences for a word in a specific context
   * 
   * Requirement 3.1: Use AI service instead of templates
   * Requirement 3.2: Prompt for natural, idiomatic sentences
   * Requirement 6.6: Implement retry logic with exponential backoff
   * Requirement 6.7: Add comprehensive error logging
   * 
   * @param request - Generation request parameters
   * @returns Promise resolving to generated examples with metadata
   * @throws AIServiceError when generation fails
   */
  async generateExamples(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const prompt = this.buildExamplePrompt(request);
    const startTime = Date.now();

    ClaudeLogger.info('Starting example generation', {
      word: request.word,
      context: request.context,
      count: request.count,
      model: this.config.model,
    });

    try {
      // Use retry logic for the entire generation operation
      const result = await withRetry(
        async () => {
          ClaudeLogger.info('Making Claude API request', {
            word: request.word,
            apiUrl: this.config.apiUrl,
          });

          const response = await httpClient.post<ClaudeMessageResponse>(
            `${this.config.apiUrl}/messages`,
            {
              model: this.config.model,
              max_tokens: 2000,
              temperature: 0.8, // Higher temperature for diversity
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
            {
              headers: {
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
              },
              timeout: this.config.timeout,
              retries: this.config.maxRetries,
            }
          );

          ClaudeLogger.info('Claude API request successful', {
            word: request.word,
            tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens,
            stopReason: response.data.stop_reason,
          });

          // Parse examples from response
          const examples = this.parseExamplesFromResponse(response.data);

          return {
            examples,
            metadata: {
              model: this.config.model,
              tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens,
              generationTime: Date.now() - startTime,
            },
          };
        },
        {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          onRetry: (error, attempt, delayMs) => {
            ClaudeLogger.warn('Retrying example generation', {
              word: request.word,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        }
      );

      ClaudeLogger.info('Example generation completed successfully', {
        word: request.word,
        exampleCount: result.value.examples.length,
        totalTimeMs: result.value.metadata.generationTime,
        attempts: result.attempts,
      });

      return result.value;
    } catch (error: any) {
      // Handle retry exhaustion
      if (error instanceof RetryExhaustedError) {
        ClaudeLogger.error('Example generation failed after all retries', {
          word: request.word,
          attempts: error.attempts,
          lastError: error.lastError.message,
          allErrors: error.errors.map(e => e.message),
        });

        throw new AIServiceError(
          `Claude API call failed after ${error.attempts} attempts: ${error.lastError.message}`,
          'claude',
          (error.lastError as any).status,
          error.lastError
        );
      }

      // Handle other errors
      ClaudeLogger.error('Example generation failed', {
        word: request.word,
        error: error.message,
        stack: error.stack,
      });

      throw new AIServiceError(
        `Claude API call failed: ${error.message}`,
        'claude',
        error.status,
        error
      );
    }
  }

  /**
   * Generate sentence chains using multiple words
   * 
   * Requirement 5.1: Generate 5-8 sentence chains per word group
   * Requirement 5.2: Each chain uses 2-4 words
   * Requirement 6.6: Implement retry logic with exponential backoff
   * Requirement 6.7: Add comprehensive error logging
   * 
   * @param words - Array of words to include in chains
   * @param context - Application context for generation
   * @param count - Number of sentence chains to generate
   * @returns Promise resolving to array of sentence chains
   * @throws AIServiceError when generation fails
   */
  async generateSentenceChains(
    words: string[],
    context: ApplicationContext,
    count: number
  ): Promise<Array<{
    sentence: string;
    translation: string;
    usedWords: string[];
  }>> {
    const prompt = this.buildSentenceChainPrompt(words, context, count);
    const startTime = Date.now();

    ClaudeLogger.info('Starting sentence chain generation', {
      wordCount: words.length,
      context,
      count,
      model: this.config.model,
    });

    try {
      // Use retry logic for the entire generation operation
      const result = await withRetry(
        async () => {
          ClaudeLogger.info('Making Claude API request for sentence chains', {
            wordCount: words.length,
            apiUrl: this.config.apiUrl,
          });

          const response = await httpClient.post<ClaudeMessageResponse>(
            `${this.config.apiUrl}/messages`,
            {
              model: this.config.model,
              max_tokens: 2000,
              temperature: 0.8,
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
            {
              headers: {
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
              },
              timeout: this.config.timeout,
              retries: this.config.maxRetries,
            }
          );

          ClaudeLogger.info('Claude API request successful for sentence chains', {
            wordCount: words.length,
            tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens,
            stopReason: response.data.stop_reason,
          });

          // Parse sentence chains from response
          const chains = this.parseSentenceChainsFromResponse(response.data);

          return chains;
        },
        {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          onRetry: (error, attempt, delayMs) => {
            ClaudeLogger.warn('Retrying sentence chain generation', {
              wordCount: words.length,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        }
      );

      ClaudeLogger.info('Sentence chain generation completed successfully', {
        wordCount: words.length,
        chainCount: result.value.length,
        totalTimeMs: Date.now() - startTime,
        attempts: result.attempts,
      });

      return result.value;
    } catch (error: any) {
      // Handle retry exhaustion
      if (error instanceof RetryExhaustedError) {
        ClaudeLogger.error('Sentence chain generation failed after all retries', {
          wordCount: words.length,
          attempts: error.attempts,
          lastError: error.lastError.message,
          allErrors: error.errors.map(e => e.message),
        });

        throw new AIServiceError(
          `Claude API call failed after ${error.attempts} attempts: ${error.lastError.message}`,
          'claude',
          (error.lastError as any).status,
          error.lastError
        );
      }

      // Handle other errors
      ClaudeLogger.error('Sentence chain generation failed', {
        wordCount: words.length,
        error: error.message,
        stack: error.stack,
      });

      throw new AIServiceError(
        `Claude API call failed: ${error.message}`,
        'claude',
        error.status,
        error
      );
    }
  }

  /**
   * Generate a complete word list with associations and sentence chains
   * 
   * Requirements 3.1, 3.2, 3.5, 4.1, 5.1, 5.2
   * 
   * @param request - Word list generation request parameters
   * @returns Promise resolving to generated words, associations, sentence chains, and metadata
   * @throws AIServiceError when generation fails
   */
  async generateWordList(request: WordListGenerationRequest): Promise<WordListGenerationResponse> {
    const prompt = this.buildWordListPrompt(request);
    const startTime = Date.now();

    ClaudeLogger.info('Starting word list generation', {
      count: request.count,
      usedWordsCount: request.usedWords.length,
      theme: request.theme,
      difficulty: request.difficulty,
      model: this.config.model,
    });

    try {
      const result = await withRetry(
        async () => {
          ClaudeLogger.info('Making Claude API request for word list', {
            count: request.count,
            apiUrl: this.config.apiUrl,
          });

          const response = await httpClient.post<ClaudeMessageResponse>(
            `${this.config.apiUrl}/messages`,
            {
              model: this.config.model,
              max_tokens: 6000,
              temperature: 0.9,
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            },
            {
              headers: {
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json',
              },
              timeout: this.config.timeout,
              retries: this.config.maxRetries,
            }
          );

          ClaudeLogger.info('Claude API request successful for word list', {
            count: request.count,
            tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens,
            stopReason: response.data.stop_reason,
          });

          const parsed = this.parseWordListFromResponse(response.data);

          return {
            words: parsed.words,
            associations: parsed.associations,
            sentenceChains: parsed.sentenceChains,
            metadata: {
              model: this.config.model,
              tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens,
              generationTime: Date.now() - startTime,
            },
          };
        },
        {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          onRetry: (error, attempt, delayMs) => {
            ClaudeLogger.warn('Retrying word list generation', {
              count: request.count,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        }
      );

      ClaudeLogger.info('Word list generation completed successfully', {
        count: request.count,
        wordCount: result.value.words.length,
        associationCount: result.value.associations.length,
        sentenceChainCount: result.value.sentenceChains.length,
        totalTimeMs: result.value.metadata.generationTime,
        attempts: result.attempts,
      });

      return result.value;
    } catch (error: any) {
      if (error instanceof RetryExhaustedError) {
        ClaudeLogger.error('Word list generation failed after all retries', {
          count: request.count,
          attempts: error.attempts,
          lastError: error.lastError.message,
          allErrors: error.errors.map(e => e.message),
        });

        throw new AIServiceError(
          `Claude API call failed after ${error.attempts} attempts: ${error.lastError.message}`,
          'claude',
          (error.lastError as any).status,
          error.lastError
        );
      }

      ClaudeLogger.error('Word list generation failed', {
        count: request.count,
        error: error.message,
        stack: error.stack,
      });

      throw new AIServiceError(
        `Claude API call failed: ${error.message}`,
        'claude',
        error.status,
        error
      );
    }
  }

  /**
   * Validate service configuration and connectivity
   * 
   * Requirement 6.1: Service validation capability
   * Requirement 6.7: Add comprehensive error logging
   * 
   * @returns Promise resolving to true if connection is valid
   */
  async validateConnection(): Promise<boolean> {
    ClaudeLogger.info('Validating Claude connection', {
      apiUrl: this.config.apiUrl,
      model: this.config.model,
    });

    try {
      // Claude doesn't have a simple health check endpoint
      // We make a minimal request to verify connectivity
      await httpClient.post<ClaudeMessageResponse>(
        `${this.config.apiUrl}/messages`,
        {
          model: this.config.model,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'test',
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          timeout: 5000, // Short timeout for validation
          retries: 1,
        }
      );

      ClaudeLogger.info('Claude connection validation successful');
      return true;
    } catch (error: any) {
      ClaudeLogger.error('Claude connection validation failed', {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Build prompt for example sentence generation
   * 
   * Requirement 3.2: Request natural and diverse examples
   * 
   * @param request - Generation request parameters
   * @returns Formatted prompt string
   */
  private buildExamplePrompt(request: AIGenerationRequest): string {
    const { word, context, count, constraints } = request;
    
    const contextDescriptions: Record<ApplicationContext, string> = {
      'daily-conversation': 'everyday informal speech and casual conversation',
      'business-communication': 'professional workplace settings and business contexts',
      'academic-writing': 'scholarly and research contexts',
      'technical-documentation': 'specialized technical fields and documentation',
      'literary-expression': 'creative and artistic writing',
    };

    const minLength = constraints?.minLength || 8;
    const maxLength = constraints?.maxLength || 20;

    return `You are an expert English teacher creating natural, diverse example sentences for vocabulary learning. Your sentences should sound like something a native speaker would actually say in real conversation or writing.

Generate ${count} natural, diverse example sentences for the word "${word}" in the context of ${contextDescriptions[context]}.

Requirements:
- Each sentence should be natural and idiomatic, as a native speaker would say it
- Vary sentence structure, length, and complexity to avoid repetition
- Include sentences between ${minLength} and ${maxLength} words
- Avoid repetitive sentence patterns and structures
- Ensure the word "${word}" appears in each sentence (case-insensitive)
- Make sentences sound authentic and conversational for the given context
- Provide accurate Chinese translation for each sentence

Format your response as a JSON array:
[
  {
    "sentence": "English sentence here",
    "translation": "中文翻译",
    "highlightWord": "${word}"
  }
]

Return ONLY the JSON array, no additional text.`;
  }

  /**
   * Build prompt for word list generation
   * 
   * Requirements 3.1, 3.2, 3.5, 4.1, 5.1, 5.2
   * 
   * @param request - Word list generation request parameters
   * @returns Formatted prompt string
   */
  private buildWordListPrompt(request: WordListGenerationRequest): string {
    const { count, usedWords, theme, difficulty } = request;

    const themeClause = theme ? ` related to the theme "${theme}"` : '';
    const difficultyClause = difficulty ? ` at a ${difficulty} difficulty level` : '';
    const usedWordsClause =
      usedWords.length > 0
        ? `\nDo NOT use any of these already-learned words: ${usedWords.join(', ')}\n`
        : '';

    return `Generate a vocabulary learning set of ${count} English words${themeClause}${difficultyClause} for Chinese learners.
${usedWordsClause}
━━━ DEFINITIONS (follow New Oxford style) ━━━
For each word, provide rich definitions like the New Oxford English-Chinese Dictionary:
- Cover ALL major parts of speech the word has (noun, verb, adjective, etc.)
- For each part of speech, list the core sense first, then extended/figurative senses
- "meaningCN": write like a real Chinese dictionary entry — concise, precise, use 【】for domain labels (e.g.【正式】【口语】【比喻】), list multiple senses separated by ；
- "meaningEN": clear English gloss with usage notes in parentheses, e.g. "(of a person) ...", "(also used figuratively)"
- Include common collocations or fixed phrases as a separate definition entry where relevant
- "partOfSpeech": use standard labels: noun / verb / adjective / adverb / phrase

Example of good definitions for "resilience":
  { "partOfSpeech": "noun", "meaningCN": "①（材料）弹性，回弹力；②（人或组织）适应力，复原力【正式】；③【比喻】在逆境中恢复的能力", "meaningEN": "the capacity to recover quickly from difficulties; (of a material) the ability to spring back into shape" }

━━━ EXAMPLES (3 per word, varied scenarios) ━━━
For each word, write 3 example sentences from 3 DIFFERENT real-life scenarios:
casual chat, news report, novel/story, workplace email, student essay, doctor/patient, social media, travel, sports commentary, parent-child conversation.

FORBIDDEN: "She showed great X" / "He demonstrated X" / "X is important". Vary subjects, tenses, structures.

━━━ OUTPUT FORMAT ━━━
Return ONLY valid JSON (no markdown):
{
  "words": [
    {
      "word": string,
      "phonetic": string (IPA),
      "definitions": [
        { "partOfSpeech": string, "meaningCN": string, "meaningEN": string }
      ],
      "examples": [
        { "sentence": string, "translation": string, "highlightWord": string },
        { "sentence": string, "translation": string, "highlightWord": string },
        { "sentence": string, "translation": string, "highlightWord": string }
      ]
    }
  ],
  "associations": [
    { "word1": string, "word2": string, "associationType": "theme"|"semantic"|"root"|"context", "description": string }
  ],
  "sentenceChains": [
    { "sentence": string, "translation": string, "usedWords": [string] }
  ]
}

Rules:
- Exactly ${count} words
- Each word: 2-4 definition entries covering different parts of speech and senses
- Each word: exactly 3 examples from 3 different scenarios
- associations: each word in at least one association
- sentenceChains: at least 5 entries using 2-4 words each`;
  }

  /**
   * Build prompt for sentence chain generation
   * 
   * Requirement 5.2: Each chain uses 2-4 words
   * Requirement 5.3: Assign application context to chains
   * 
   * @param words - Array of words to include
   * @param context - Application context
   * @param count - Number of chains to generate
   * @returns Formatted prompt string
   */
  private buildSentenceChainPrompt(
    words: string[],
    context: ApplicationContext,
    count: number
  ): string {
    const contextDescriptions: Record<ApplicationContext, string> = {
      'daily-conversation': 'everyday informal speech and casual conversation',
      'business-communication': 'professional workplace settings and business contexts',
      'academic-writing': 'scholarly and research contexts',
      'technical-documentation': 'specialized technical fields and documentation',
      'literary-expression': 'creative and artistic writing',
    };

    return `You are an expert English teacher creating natural sentence chains that use multiple vocabulary words together. Your sentences should be coherent, contextually appropriate, and sound natural.

Generate ${count} natural sentence chains that use multiple words from this list: ${words.join(', ')}.

Requirements:
- Each sentence should use at least 2 and at most 4 words from the provided list
- Sentences should be natural and contextually appropriate for ${contextDescriptions[context]}
- Vary sentence structure and complexity
- Make sentences coherent and meaningful
- Provide accurate Chinese translation for each sentence
- Track which words from the list are used in each sentence

Format your response as a JSON array:
[
  {
    "sentence": "English sentence using multiple words",
    "translation": "中文翻译",
    "usedWords": ["word1", "word2"]
  }
]

Return ONLY the JSON array, no additional text.`;
  }

  /**
   * Parse example sentences from Claude API response
   * 
   * Handles JSON extraction and validation with proper error handling.
   * 
   * @param data - Claude API response data
   * @returns Array of parsed example sentences
   * @throws AIServiceError if parsing fails
   */
  private parseExamplesFromResponse(data: ClaudeMessageResponse): Array<{
    sentence: string;
    translation: string;
    highlightWord: string;
  }> {
    try {
      const content = data.content[0]?.text;
      
      if (!content) {
        throw new Error('No content in API response');
      }

      // Try to extract JSON array from response
      // Handle cases where AI might include markdown code blocks or extra text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Failed to find JSON array in response');
      }

      const examples = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!Array.isArray(examples)) {
        throw new Error('Response is not an array');
      }

      // Validate each example has required fields
      for (const example of examples) {
        if (!example.sentence || !example.translation || !example.highlightWord) {
          throw new Error('Example missing required fields');
        }
      }

      return examples;
    } catch (error: any) {
      throw new AIServiceError(
        `Failed to parse examples from Claude response: ${error.message}`,
        'claude',
        undefined,
        error
      );
    }
  }

  /**
   * Parse sentence chains from Claude API response
   * 
   * Handles JSON extraction and validation with proper error handling.
   * 
   * @param data - Claude API response data
   * @returns Array of parsed sentence chains
   * @throws AIServiceError if parsing fails
   */
  private parseSentenceChainsFromResponse(data: ClaudeMessageResponse): Array<{
    sentence: string;
    translation: string;
    usedWords: string[];
  }> {
    try {
      const content = data.content[0]?.text;
      
      if (!content) {
        throw new Error('No content in API response');
      }

      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Failed to find JSON array in response');
      }

      const chains = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!Array.isArray(chains)) {
        throw new Error('Response is not an array');
      }

      // Validate each chain has required fields
      for (const chain of chains) {
        if (!chain.sentence || !chain.translation || !Array.isArray(chain.usedWords)) {
          throw new Error('Sentence chain missing required fields');
        }
      }

      return chains;
    } catch (error: any) {
      throw new AIServiceError(
        `Failed to parse sentence chains from Claude response: ${error.message}`,
        'claude',
        undefined,
        error
      );
    }
  }

  /**
   * Parse word list from Claude API response
   * 
   * Extracts and validates the complete word list structure including
   * words, associations, and sentence chains.
   * 
   * @param data - Claude API response data
   * @returns Parsed word list data
   * @throws AIServiceError if parsing fails
   */
  private parseWordListFromResponse(data: ClaudeMessageResponse): {
    words: WordListGenerationResponse['words'];
    associations: WordListGenerationResponse['associations'];
    sentenceChains: WordListGenerationResponse['sentenceChains'];
  } {
    try {
      const content = data.content[0]?.text;

      if (!content) {
        ClaudeLogger.error('No content in Claude response', { data });
        throw new Error('No content in API response');
      }

      // Use extractJSON utility to handle various response formats
      const parsed = extractJSON(content);

      if (!parsed) {
        ClaudeLogger.error('Failed to extract JSON from Claude response', { content });
        throw new Error('Failed to extract JSON from response');
      }

      // Validate required fields
      if (!Array.isArray(parsed.words) || !Array.isArray(parsed.associations) || !Array.isArray(parsed.sentenceChains)) {
        ClaudeLogger.error('Missing required arrays in parsed response', { 
          keys: Object.keys(parsed),
          hasWords: Array.isArray(parsed.words),
          hasAssociations: Array.isArray(parsed.associations),
          hasSentenceChains: Array.isArray(parsed.sentenceChains)
        });
        throw new Error('Response missing required arrays');
      }

      return {
        words: parsed.words as WordListGenerationResponse['words'],
        associations: parsed.associations as WordListGenerationResponse['associations'],
        sentenceChains: parsed.sentenceChains as WordListGenerationResponse['sentenceChains'],
      };
    } catch (error: any) {
      throw new AIServiceError(
        `Failed to parse word list from Claude response: ${error.message}`,
        'claude',
        undefined,
        error
      );
    }
  }
}

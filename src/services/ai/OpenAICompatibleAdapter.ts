/**
 * OpenAI-Compatible Adapter Base Class
 *
 * Abstract base class for AI providers that implement the OpenAI chat completions
 * API format (e.g., OpenAI, DeepSeek, Doubao). Extracts common HTTP call logic
 * from OpenAIAdapter so that provider-specific adapters only need to supply
 * configuration and a provider name.
 *
 * **Validates: Requirements 1.1, 1.5, 2.1, 2.5**
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
import { GenerationError } from '../../types/error';

/**
 * Determine if an error is worth retrying.
 * - GenerationError (format/parse failures) → not retryable
 * - HTTP 4xx client errors (except 429 rate-limit) → not retryable
 * - Network errors, 5xx, 429 → retryable
 */
function isRetryableError(error: Error): boolean {
  // Format/parse errors won't improve on retry
  if (error.name === 'GenerationError') return false;

  if (error instanceof AIServiceError) {
    const status = error.statusCode;
    if (status === undefined) return true; // network-level, retry
    if (status === 429) return true;       // rate-limited, retry
    if (status >= 400 && status < 500) return false; // 4xx client error, don't retry
  }

  return true;
}

/**
 * OpenAI-compatible API response structure for chat completions
 */
interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Logger utility that prefixes messages with a dynamic provider name.
 */
class ProviderLogger {
  constructor(private readonly providerName: string) {}

  private get prefix(): string {
    return `[${this.providerName.toUpperCase()}]`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(
      `[${new Date().toISOString()}] ${this.prefix} [INFO] ${message}`,
      context ?? ''
    );
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(
      `[${new Date().toISOString()}] ${this.prefix} [ERROR] ${message}`,
      context ?? ''
    );
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(
      `[${new Date().toISOString()}] ${this.prefix} [WARN] ${message}`,
      context ?? ''
    );
  }
}

/**
 * Abstract base class for OpenAI-compatible AI providers.
 *
 * Subclasses only need to call `super(config, providerName)` in their
 * constructor — all HTTP logic is inherited from here.
 *
 * Requirement 1.1 / 2.1: Shared adapter logic for DeepSeek / Doubao
 * Requirement 1.5 / 2.5: validateConnection uses a minimal chat request
 *                         (max_tokens: 1) instead of /models, ensuring
 *                         compatibility with providers that don't expose
 *                         a model-listing endpoint.
 */
export abstract class OpenAICompatibleAdapter implements AIService {
  protected config: AIServiceConfig;
  protected providerName: string;
  protected logger: ProviderLogger;

  constructor(config: AIServiceConfig, providerName: string) {
    this.config = config;
    this.providerName = providerName;
    this.logger = new ProviderLogger(providerName);
  }

  // ---------------------------------------------------------------------------
  // AIService interface implementation
  // ---------------------------------------------------------------------------

  /**
   * Generate example sentences for a word in a specific context.
   *
   * Requirement 3.1: Use AI service for natural sentence generation
   * Requirement 3.2: Prompt for natural, idiomatic sentences
   */
  async generateExamples(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const prompt = this.buildExamplePrompt(request);
    const startTime = Date.now();

    this.logger.info('Starting example generation', {
      word: request.word,
      context: request.context,
      count: request.count,
      model: this.config.model,
    });

    try {
      const result = await withRetry(
        async () => {
          this.logger.info('Making API request', {
            word: request.word,
            apiUrl: this.config.apiUrl,
          });

          const response = await httpClient.post<OpenAIChatCompletionResponse>(
            `${this.config.apiUrl}/chat/completions`,
            {
              model: this.config.model,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an expert English teacher creating natural, diverse example sentences for vocabulary learning. Your sentences should sound like something a native speaker would actually say in real conversation or writing.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.8,
              max_tokens: 2000,
            },
            {
              headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: this.config.timeout,
              retries: this.config.maxRetries,
            }
          );

          this.logger.info('API request successful', {
            word: request.word,
            tokensUsed: response.data.usage.total_tokens,
            finishReason: response.data.choices[0]?.finish_reason,
          });

          const examples = this.parseExamplesFromResponse(response.data);

          return {
            examples,
            metadata: {
              model: this.config.model,
              tokensUsed: response.data.usage.total_tokens,
              generationTime: Date.now() - startTime,
            },
          };
        },
        {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          onRetry: (error, attempt, delayMs) => {
            this.logger.warn('Retrying example generation', {
              word: request.word,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        }
      );

      this.logger.info('Example generation completed successfully', {
        word: request.word,
        exampleCount: result.value.examples.length,
        totalTimeMs: result.value.metadata.generationTime,
        attempts: result.attempts,
      });

      return result.value;
    } catch (error: unknown) {
      if (error instanceof RetryExhaustedError) {
        this.logger.error('Example generation failed after all retries', {
          word: request.word,
          attempts: error.attempts,
          lastError: error.lastError.message,
          allErrors: error.errors.map((e) => e.message),
        });

        throw new AIServiceError(
          `${this.providerName} API call failed after ${error.attempts} attempts: ${error.lastError.message}`,
          this.providerName,
          (error.lastError as { status?: number }).status,
          error.lastError
        );
      }

      const err = error as { message?: string; status?: number; stack?: string };
      this.logger.error('Example generation failed', {
        word: request.word,
        error: err.message,
        stack: err.stack,
      });

      throw new AIServiceError(
        `${this.providerName} API call failed: ${err.message}`,
        this.providerName,
        err.status,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate sentence chains using multiple words.
   *
   * Requirement 5.1: Generate 5-8 sentence chains per word group
   * Requirement 5.2: Each chain uses 2-4 words
   */
  async generateSentenceChains(
    words: string[],
    context: ApplicationContext,
    count: number
  ): Promise<
    Array<{
      sentence: string;
      translation: string;
      usedWords: string[];
    }>
  > {
    const prompt = this.buildSentenceChainPrompt(words, context, count);
    const startTime = Date.now();

    this.logger.info('Starting sentence chain generation', {
      wordCount: words.length,
      context,
      count,
      model: this.config.model,
    });

    try {
      const result = await withRetry(
        async () => {
          this.logger.info('Making API request for sentence chains', {
            wordCount: words.length,
            apiUrl: this.config.apiUrl,
          });

          const response = await httpClient.post<OpenAIChatCompletionResponse>(
            `${this.config.apiUrl}/chat/completions`,
            {
              model: this.config.model,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an expert English teacher creating natural sentence chains that use multiple vocabulary words together. Your sentences should be coherent, contextually appropriate, and sound natural.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.8,
              max_tokens: 2000,
            },
            {
              headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: this.config.timeout,
              retries: this.config.maxRetries,
            }
          );

          this.logger.info('API request successful for sentence chains', {
            wordCount: words.length,
            tokensUsed: response.data.usage.total_tokens,
            finishReason: response.data.choices[0]?.finish_reason,
          });

          return this.parseSentenceChainsFromResponse(response.data);
        },
        {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          onRetry: (error, attempt, delayMs) => {
            this.logger.warn('Retrying sentence chain generation', {
              wordCount: words.length,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        }
      );

      this.logger.info('Sentence chain generation completed successfully', {
        wordCount: words.length,
        chainCount: result.value.length,
        totalTimeMs: Date.now() - startTime,
        attempts: result.attempts,
      });

      return result.value;
    } catch (error: unknown) {
      if (error instanceof RetryExhaustedError) {
        this.logger.error('Sentence chain generation failed after all retries', {
          wordCount: words.length,
          attempts: error.attempts,
          lastError: error.lastError.message,
          allErrors: error.errors.map((e) => e.message),
        });

        throw new AIServiceError(
          `${this.providerName} API call failed after ${error.attempts} attempts: ${error.lastError.message}`,
          this.providerName,
          (error.lastError as { status?: number }).status,
          error.lastError
        );
      }

      const err = error as { message?: string; status?: number; stack?: string };
      this.logger.error('Sentence chain generation failed', {
        wordCount: words.length,
        error: err.message,
        stack: err.stack,
      });

      throw new AIServiceError(
        `${this.providerName} API call failed: ${err.message}`,
        this.providerName,
        err.status,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate service configuration and connectivity.
   *
   * Sends a minimal chat completion request (max_tokens: 1) instead of
   * calling /models, so this works with providers like DeepSeek and Doubao
   * that may not expose a model-listing endpoint.
   *
   * Requirement 1.5 / 2.5: Compatible validateConnection
   */
  async validateConnection(): Promise<boolean> {
    this.logger.info('Validating connection', {
      apiUrl: this.config.apiUrl,
      model: this.config.model,
    });

    try {
      await httpClient.post<OpenAIChatCompletionResponse>(
        `${this.config.apiUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: 'hi',
            },
          ],
          max_tokens: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
          retries: 1,
        }
      );

      this.logger.info('Connection validation successful');
      return true;
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error('Connection validation failed', {
        error: err.message,
      });
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // generateWordList — single-call generation of words, associations, chains
  // ---------------------------------------------------------------------------

  /**
   * Generate a complete word list with associations and sentence chains in a
   * single AI call.
   *
   * Builds a prompt that requests words (with IPA phonetics, bilingual
   * definitions, and example sentences), word associations, and sentence
   * chains all in one request. Returns the parsed response along with
   * generation metadata.
   *
   * Requirements 3.1, 3.2, 3.5, 4.1, 5.1, 5.2
   */
  async generateWordList(request: WordListGenerationRequest): Promise<WordListGenerationResponse> {
    const prompt = this.buildWordListPrompt(request);
    const startTime = Date.now();

    this.logger.info('Starting word list generation', {
      count: request.count,
      usedWordsCount: request.usedWords.length,
      theme: request.theme,
      difficulty: request.difficulty,
      model: this.config.model,
    });

    try {
      const result = await withRetry(
        async () => {
          this.logger.info('Making API request for word list', {
            count: request.count,
            apiUrl: this.config.apiUrl,
          });

          const response = await httpClient.post<OpenAIChatCompletionResponse>(
            `${this.config.apiUrl}/chat/completions`,
            {
              model: this.config.model,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are an expert English vocabulary teacher. Generate structured vocabulary learning content in valid JSON format only. Do not include any text outside the JSON object.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.9,
              max_tokens: 6000,
            },
            {
              headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: this.config.timeout,
              retries: this.config.maxRetries,
            }
          );

          this.logger.info('API request successful for word list', {
            count: request.count,
            tokensUsed: response.data.usage.total_tokens,
            finishReason: response.data.choices[0]?.finish_reason,
          });

          const parsed = this.parseWordListFromResponse(response.data);

          return {
            words: parsed.words,
            associations: parsed.associations,
            sentenceChains: parsed.sentenceChains,
            metadata: {
              model: this.config.model,
              tokensUsed: response.data.usage.total_tokens,
              generationTime: Date.now() - startTime,
            },
          };
        },
        {
          maxAttempts: 3,
          backoffMs: 1000,
          backoffMultiplier: 2,
          shouldRetry: isRetryableError,
          onRetry: (error, attempt, delayMs) => {
            this.logger.warn('Retrying word list generation', {
              count: request.count,
              attempt,
              delayMs,
              error: error.message,
            });
          },
        }
      );

      this.logger.info('Word list generation completed successfully', {
        count: request.count,
        wordCount: result.value.words.length,
        associationCount: result.value.associations.length,
        sentenceChainCount: result.value.sentenceChains.length,
        totalTimeMs: result.value.metadata.generationTime,
        attempts: result.attempts,
      });

      return result.value;
    } catch (error: unknown) {
      if (error instanceof RetryExhaustedError) {
        this.logger.error('Word list generation failed after all retries', {
          count: request.count,
          attempts: error.attempts,
          lastError: error.lastError.message,
          allErrors: error.errors.map((e) => e.message),
        });

        throw new AIServiceError(
          `${this.providerName} API call failed after ${error.attempts} attempts: ${error.lastError.message}`,
          this.providerName,
          (error.lastError as { status?: number }).status,
          error.lastError
        );
      }

      const err = error as { message?: string; status?: number; stack?: string };
      this.logger.error('Word list generation failed', {
        count: request.count,
        error: err.message,
        stack: err.stack,
      });

      throw new AIServiceError(
        `${this.providerName} API call failed: ${err.message}`,
        this.providerName,
        err.status,
        error instanceof Error ? error : undefined
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildExamplePrompt(request: AIGenerationRequest): string {
    const { word, context, count, constraints } = request;

    const contextDescriptions: Record<ApplicationContext, string> = {
      'daily-conversation': 'everyday informal speech and casual conversation',
      'business-communication': 'professional workplace settings and business contexts',
      'academic-writing': 'scholarly and research contexts',
      'technical-documentation': 'specialized technical fields and documentation',
      'literary-expression': 'creative and artistic writing',
    };

    const minLength = constraints?.minLength ?? 8;
    const maxLength = constraints?.maxLength ?? 20;

    return `Generate ${count} natural, diverse example sentences for the word "${word}" in the context of ${contextDescriptions[context]}.

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

    return `Generate ${count} natural sentence chains that use multiple words from this list: ${words.join(', ')}.

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

  private parseExamplesFromResponse(data: OpenAIChatCompletionResponse): Array<{
    sentence: string;
    translation: string;
    highlightWord: string;
  }> {
    try {
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in API response');
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('Failed to find JSON array in response');
      }

      const examples = JSON.parse(jsonMatch[0]) as unknown[];

      if (!Array.isArray(examples)) {
        throw new Error('Response is not an array');
      }

      for (const example of examples) {
        const ex = example as Record<string, unknown>;
        if (!ex.sentence || !ex.translation || !ex.highlightWord) {
          throw new Error('Example missing required fields');
        }
      }

      return examples as Array<{
        sentence: string;
        translation: string;
        highlightWord: string;
      }>;
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new AIServiceError(
        `Failed to parse examples from ${this.providerName} response: ${err.message}`,
        this.providerName,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  private parseSentenceChainsFromResponse(data: OpenAIChatCompletionResponse): Array<{
    sentence: string;
    translation: string;
    usedWords: string[];
  }> {
    try {
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in API response');
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('Failed to find JSON array in response');
      }

      const chains = JSON.parse(jsonMatch[0]) as unknown[];

      if (!Array.isArray(chains)) {
        throw new Error('Response is not an array');
      }

      for (const chain of chains) {
        const c = chain as Record<string, unknown>;
        if (!c.sentence || !c.translation || !Array.isArray(c.usedWords)) {
          throw new Error('Sentence chain missing required fields');
        }
      }

      return chains as Array<{
        sentence: string;
        translation: string;
        usedWords: string[];
      }>;
    } catch (error: unknown) {
      const err = error as { message?: string };
      throw new AIServiceError(
        `Failed to parse sentence chains from ${this.providerName} response: ${err.message}`,
        this.providerName,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Build the single-call prompt for word list generation.
   *
   * The prompt requests words with IPA phonetics, bilingual definitions,
   * at least 2 example sentences per word, word associations, and sentence
   * chains — all in one JSON response.
   *
   * Requirements 3.1, 3.2, 3.5, 4.1, 5.1, 5.2
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
   * Parse the word list generation response from the AI.
   *
   * Extracts the JSON object from the response content, supporting both
   * plain JSON and Markdown code-block wrapped responses.
   */
  private parseWordListFromResponse(data: OpenAIChatCompletionResponse): {
    words: WordListGenerationResponse['words'];
    associations: WordListGenerationResponse['associations'];
    sentenceChains: WordListGenerationResponse['sentenceChains'];
  } {
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('[parseWordListFromResponse] No content in response. Full data:', JSON.stringify(data));
      throw new GenerationError('AI 返回数据格式无效');
    }

    // Strip Markdown code fences if present (```json ... ``` or ``` ... ```)
    const stripped = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    // Try to extract the first complete JSON object {...}
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[parseWordListFromResponse] No JSON object found in content:', content);
      throw new GenerationError('AI 返回数据格式无效');
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch (e) {
      console.error('[parseWordListFromResponse] JSON.parse failed:', e, '\nContent was:', jsonMatch[0]);
      throw new GenerationError('AI 返回数据格式无效');
    }

    if (!Array.isArray(parsed.words) || !Array.isArray(parsed.associations) || !Array.isArray(parsed.sentenceChains)) {
      console.error('[parseWordListFromResponse] Missing required arrays. Keys found:', Object.keys(parsed), '\nParsed:', JSON.stringify(parsed).slice(0, 500));
      throw new GenerationError('AI 返回数据格式无效');
    }

    return {
      words: parsed.words as WordListGenerationResponse['words'],
      associations: parsed.associations as WordListGenerationResponse['associations'],
      sentenceChains: parsed.sentenceChains as WordListGenerationResponse['sentenceChains'],
    };
  }
}

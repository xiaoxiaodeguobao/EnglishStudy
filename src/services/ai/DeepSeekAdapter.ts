/**
 * DeepSeek Adapter Implementation
 *
 * Implements the AIService interface for DeepSeek API integration.
 * DeepSeek exposes an OpenAI-compatible chat completions endpoint, so all
 * HTTP logic is inherited from OpenAICompatibleAdapter.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 */

import { AIServiceConfig } from './types';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

/**
 * DeepSeek Adapter
 *
 * Extends OpenAICompatibleAdapter for the DeepSeek API.
 * All HTTP logic (OpenAI-compatible POST to {apiUrl}/chat/completions with
 * Bearer token, 4xx/5xx error handling, and minimal validateConnection
 * request) is inherited from the base class.
 *
 * Requirement 1.1: Implements the same AIService interface as OpenAIAdapter
 * Requirement 1.2: Configured via VITE_DEEPSEEK_API_KEY, VITE_DEEPSEEK_MODEL,
 *                  VITE_DEEPSEEK_API_URL (passed in through AIServiceConfig)
 * Requirement 1.3: Sends OpenAI-compatible POST to {apiUrl}/chat/completions
 *                  with Bearer token authentication
 * Requirement 1.4: HTTP 4xx/5xx errors are thrown as AIServiceError with
 *                  provider='deepseek', statusCode, and original error message
 * Requirement 1.5: validateConnection sends a max_tokens: 1 minimal request
 */
export class DeepSeekAdapter extends OpenAICompatibleAdapter {
  constructor(config: AIServiceConfig) {
    super(config, 'deepseek');
  }
}
